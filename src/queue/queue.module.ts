import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { redisConfig } from '../config/bullmq.config';
import { QueueProducerService } from './queue-producer.service';
import { QueueConsumeService } from './queue-consumer.service';
import { FilesModule } from 'src/files/files.module';

@Module({
    imports: [
        forwardRef(() => FilesModule),
        BullModule.forRoot({
            connection: redisConfig.connection
        }),
        BullModule.registerQueue({
            name: 'file-processing-queue',
        }),
    ],
    providers: [
        QueueProducerService,
        QueueConsumeService
    ],
    exports: [
        QueueProducerService,
        QueueConsumeService
    ]
})
export class QueueModule { }