import { ApiProperty } from '@nestjs/swagger';

export class UploadFileResponseDto {
    @ApiProperty({
        example: 'pending',
        description: 'The current status of the file upload',
    })
    status: string;

    @ApiProperty({
        example: 4,
        description: 'The unique identifier of the uploaded file',
    })
    fileId: number;
}