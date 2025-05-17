import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadFile } from './entities/upload-file.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([UploadFile])
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule { }
