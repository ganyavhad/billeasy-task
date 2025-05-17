import { HttpException, Injectable, Logger } from '@nestjs/common';
import { UploadFileDto } from './dto/upload-file.dto';
import { UploadFile } from './entities/upload-file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { readFileSync, unlinkSync } from 'fs';
import { UserDto } from './dto/user.dto';
import { User } from '../users/entities/user.entity';
import { FileDto } from './dto/file.dto';
import { UploadFileResponseDto } from './dto/upload-file-response.dto';
import { QueueProducerService } from '../queue/queue-producer.service';
import { FileStatus } from './file-status.enum';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    @InjectRepository(UploadFile)
    private readonly uploadFileRepository: Repository<UploadFile>,
    private readonly queueProducerService: QueueProducerService,
  ) { }

  async upload(file: Express.Multer.File, body: UploadFileDto, user: UserDto): Promise<UploadFileResponseDto> {
    this.logger.debug(`Uploading file: ${file.originalname} for user: ${user.id}`);
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
      this.logger.debug(`File saved to database with ID: ${savedFile.id}`);

      this.queueProducerService.addJob(savedFile.id);
      this.logger.debug(`Job added to queue for file ID: ${savedFile.id}`);

      return {
        status: savedFile.status,
        fileId: savedFile.id,
      };
    } catch (error) {
      this.logger.error('File upload failed', error.stack);
      throw new Error('File upload failed');
    }
  }

  async findAll(user: UserDto, page: number, limit: number): Promise<{ files: FileDto[], totalFiles: number }> {
    this.logger.debug(`Fetching files for user: ${user.id} with page: ${page}, limit: ${limit}`);
    try {
      if (!page || page < 1) {
        page = 1;
      }
      if (!limit || limit < 1) {
        limit = 10;
      }
      const files = await this.uploadFileRepository.find({
        where: {
          user_id: { id: user.id },
        },
        skip: (page - 1) * limit,
        take: limit,
      });
      const totalFiles = await this.uploadFileRepository.count({
        where: {
          user_id: { id: user.id },
        },
      })
      this.logger.debug(`Fetched ${files.length} files for user: ${user.id}`);
      return { files, totalFiles };
    } catch (error) {
      this.logger.error('Failed to fetch files', error.stack);
      throw new Error('Failed to fetch files');
    }
  }

  async findOne(id: number, user: UserDto): Promise<FileDto> {
    this.logger.debug(`Fetching file with ID: ${id} for user: ${user.id}`);
    try {
      const file = await this.uploadFileRepository.findOne({
        where: {
          id,
          user_id: { id: user.id },
        },
      });
      if (!file) {
        this.logger.warn(`File with ID: ${id} not found for user: ${user.id}`);
        throw new HttpException('File not found', 404);
      }
      this.logger.debug(`File with ID: ${id} fetched successfully`);
      return file;
    } catch (error) {
      this.logger.error(`Failed to fetch file with ID: ${id}`, error.stack);
      throw error;
    }
  }

  async remove(id: number, user: UserDto): Promise<{ status: string }> {
    this.logger.debug(`Removing file with ID: ${id} for user: ${user.id}`);
    try {
      const file = await this.uploadFileRepository.findOne({
        where: {
          id,
          user_id: { id: user.id },
        },
      });
      if (!file) {
        this.logger.warn(`File with ID: ${id} not found for user: ${user.id}`);
        throw new HttpException('File not found', 404);
      }
      if (file.storage_path) {
        unlinkSync(file.storage_path);
        this.logger.debug(`File deleted from storage: ${file.storage_path}`);
      }
      await this.uploadFileRepository.delete(id);
      this.logger.debug(`File with ID: ${id} deleted successfully`);
      return { status: 'success' };
    } catch (error) {
      this.logger.error(`Failed to remove file with ID: ${id}`, error.stack);
      throw error;
    }
  }

  async processFile(fileId: number): Promise<void> {
    this.logger.debug(`Processing file with ID: ${fileId}`);
    try {
      const file = await this.uploadFileRepository.findOne({ where: { id: fileId } });
      if (!file) {
        this.logger.warn(`File with ID: ${fileId} not found`);
        return;
      }
      file.status = FileStatus.PROCESSING;
      file.uploaded_at = new Date();
      await this.uploadFileRepository.save(file);
      this.logger.debug(`File with ID: ${fileId} marked as processing`);
    } catch (error) {
      this.logger.error(`Failed to process file with ID: ${fileId}`, error.stack);
      this.handleError(fileId);
      throw error;
    }
  }

  async updateFileStatus(fileId: number): Promise<void> {
    this.logger.debug(`Updating status for file with ID: ${fileId}`);
    try {
      const file = await this.uploadFileRepository.findOne({ where: { id: fileId } });
      if (!file) {
        this.logger.warn(`File with ID: ${fileId} not found`);
        return;
      }
      file.status = FileStatus.PROCESSED;
      file.uploaded_at = new Date();
      file.extracted_data = readFileSync(file.storage_path, 'base64');
      await this.uploadFileRepository.save(file);
      this.logger.debug(`File with ID: ${fileId} marked as processed`);
    } catch (error) {
      this.logger.error(`Failed to update status for file with ID: ${fileId}`, error.stack);
      this.handleError(fileId);
      throw error;
    }
  }

  async handleError(fileId: number): Promise<void> {
    this.logger.debug(`Handling error for file with ID: ${fileId}`);
    try {
      const file = await this.uploadFileRepository.findOne({ where: { id: fileId } });
      if (!file) {
        this.logger.warn(`File with ID: ${fileId} not found`);
        return;
      }
      file.status = FileStatus.ERROR;
      await this.uploadFileRepository.save(file);
      this.logger.debug(`File with ID: ${fileId} marked as error`);
    } catch (error) {
      this.logger.error(`Failed to handle error for file with ID: ${fileId}`, error.stack);
      throw error;
    }
  }

  async sendToQueue(fileId: number): Promise<void> {
    this.logger.debug(`Sending file with ID: ${fileId} to queue`);
    this.queueProducerService.addJob(fileId);
  }
}

