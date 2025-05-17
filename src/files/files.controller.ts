import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFile, Query, Get, Param, Delete } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiSecurity, ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import { User } from 'src/decorators/user.decorator';
import { UserDto } from './dto/user.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { UploadFileResponseDto } from './dto/upload-file-response.dto';
import { FileDto } from './dto/file.dto';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @Post('upload')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Upload a file' })
  @ApiSecurity('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload data',
    type: UploadFileDto,
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully', type: UploadFileResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const nameWithoutSpaces = file.originalname.replace(/\s+/g, '');
          const timestamp = Date.now();
          const ext = path.extname(nameWithoutSpaces);
          const baseName = path.basename(nameWithoutSpaces, ext);
          const uniqueName = `${baseName}_${timestamp}${ext}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadFileDto,
    @User() user: UserDto,
  ): Promise<UploadFileResponseDto> {
    return this.filesService.upload(file, body, user);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all files' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  @ApiResponse({ status: 200, description: 'List of files retrieved successfully', type: [FileDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @User() user: any,
    @Query() query: any,
  ): Promise<{ files: FileDto[], totalFiles: number }> {
    const { page, limit } = query;
    return this.filesService.findAll(user, page, limit);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get a file by ID' })
  @ApiSecurity('access-token')
  @ApiResponse({ status: 200, description: 'File retrieved successfully', type: FileDto })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(
    @User() user: UserDto,
    @Param('id') id: number,
  ): Promise<FileDto> {
    return this.filesService.findOne(+id, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a file by ID' })
  @ApiSecurity('access-token')
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(
    @User() user: UserDto,
    @Param('id') id: number,
  ): Promise<{ status: string }> {
    return this.filesService.remove(+id, user);
  }
}
