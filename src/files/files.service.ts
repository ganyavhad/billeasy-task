import { HttpException, Injectable } from '@nestjs/common';
import { UploadFileDto } from './dto/upload-file.dto';
import { UploadFile } from './entities/upload-file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlinkSync } from 'fs';
import { UserDto } from './dto/user.dto';
import { User } from 'src/users/entities/user.entity';
import { FileDto } from './dto/file.dto';
import { UploadFileResponseDto } from './dto/upload-file-response.dto';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(UploadFile)
    private readonly uploadFileRepository: Repository<UploadFile>,
  ) { }

  async upload(file: Express.Multer.File, body: UploadFileDto, user: UserDto): Promise<UploadFileResponseDto> {
    try {
      const userEntity = new User();
      userEntity.id = user.id;
      const uploadFileEntity = new UploadFile();
      uploadFileEntity.original_filename = file.originalname;
      uploadFileEntity.description = body.description;
      uploadFileEntity.title = body.title;
      uploadFileEntity.user_id = userEntity;
      uploadFileEntity.storage_path = file.path;
      const savedFile = await this.uploadFileRepository.save(uploadFileEntity);
      return {
        status: savedFile.status,
        fileId: savedFile.id
      };
    } catch (error) {
      throw new Error('File upload failed');
    }
  }

  async findAll(user: UserDto, page: number, limit: number): Promise<FileDto[]> {
    try {
      if (!page || page < 1) {
        page = 1;
      }
      if (!limit || limit < 1) {
        limit = 10;
      }
      return await this.uploadFileRepository.find({
        where: {
          user_id: { id: user.id }
        },
        skip: (page - 1) * limit,
        take: limit
      });
    } catch (error) {
      throw new Error('Failed to fetch files');
    }
  }

  async findOne(id: number, user: UserDto): Promise<FileDto> {
    try {
      const file = await this.uploadFileRepository.findOne({
        where: {
          id,
          user_id: { id: user.id }
        },
      });
      if (!file) {
        throw new HttpException('File not found', 404);
      }
      return file;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number, user: UserDto): Promise<{ status: string }> {
    try {
      const file = await this.uploadFileRepository.findOne({
        where: {
          id,
          user_id: { id: user.id }
        },
      });
      if (!file) {
        throw new HttpException('File not found', 404);
      }
      if (file.storage_path) {
        await unlinkSync(file.storage_path);
      }
      await this.uploadFileRepository.delete(id);
      return { status: 'success' };
    } catch (error) {
      throw error;
    }
  }
}

