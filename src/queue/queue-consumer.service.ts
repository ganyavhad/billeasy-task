import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { FilesService } from 'src/files/files.service';

@Processor('file-processing-queue')
export class QueueConsumeService extends WorkerHost {
    private readonly logger = new Logger(QueueConsumeService.name);

    constructor(
        private readonly filesService: FilesService
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        this.logger.debug(`Processing job: ${job.id} with data: ${JSON.stringify(job.data)}`);

        // Simulate job processing
        await new Promise((resolve) => setTimeout(resolve, 10000));

        this.logger.debug(`Job ${job.id} processed successfully`);
        return 'Job processed';
    }

    @OnWorkerEvent('completed')
    async onCompleted(job: Job<any, any, string>) {
        this.logger.debug(`Job completed event received for job: ${job.id}`);

        try {
            // Update file status in the database
            await this.filesService.updateFileStatus(job.data.fileId);
            this.logger.debug(`File status updated successfully for job: ${job.id}`);
        } catch (error) {
            this.logger.error(`Error updating file status for job: ${job.id}`, error.stack);
        }
    }
}
