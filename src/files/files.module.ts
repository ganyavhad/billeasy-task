import { forwardRef, Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadFile } from './entities/upload-file.entity';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => QueueModule),
    TypeOrmModule.forFeature([UploadFile])
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService, TypeOrmModule.forFeature([UploadFile])],
})
export class FilesModule { }
