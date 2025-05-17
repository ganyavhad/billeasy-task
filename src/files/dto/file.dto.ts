import { ApiProperty } from '@nestjs/swagger';

export class FileDto {
    @ApiProperty({
        example: 3,
        description: 'The unique identifier of the file',
    })
    id: number;

    @ApiProperty({
        example: 'Screenshot 2025-04-14 102723.png',
        description: 'The original name of the uploaded file',
    })
    original_filename: string;

    @ApiProperty({
        example: 'uploads\\Screenshot2025-04-14102723_1747472335790.png',
        description: 'The storage path of the uploaded file',
    })
    storage_path: string;

    @ApiProperty({
        example: 'Test File',
        description: 'The title of the file',
    })
    title: string;

    @ApiProperty({
        example: 'Test Description',
        description: 'A brief description of the file',
    })
    description: string;

    @ApiProperty({
        example: 'pending',
        description: 'The current status of the file',
    })
    status: string;

    @ApiProperty({
        example: null,
        description: 'The extracted data from the file, if any',
        nullable: true,
    })
    extracted_data: any;

    @ApiProperty({
        example: '2025-05-17T08:58:55.815Z',
        description: 'The date and time when the file was uploaded',
    })
    uploaded_at: Date;
}