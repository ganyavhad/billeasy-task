import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueProducerService {
    private readonly logger = new Logger(QueueProducerService.name);

    constructor(@InjectQueue('file-processing-queue') private readonly queue: Queue) { }

    async addJob(id: number): Promise<void> {
        this.logger.debug(`Adding job to queue with fileId: ${id}`);

        try {
            await this.queue.add('process-file', { fileId: id });
            this.logger.debug(`Job added successfully to queue with fileId: ${id}`);
        } catch (error) {
            this.logger.error(`Failed to add job to queue with fileId: ${id}`, error.stack);
        }
    }
}