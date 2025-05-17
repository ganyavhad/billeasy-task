import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {

    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'The file to be uploaded',
    })
    file: any;

    @ApiProperty({
        example: 'My File',
        description: 'The title of the file',
    })
    title: string;

    @ApiProperty({
        example: 'This is a description of the file.',
        description: 'A brief description of the file',
    })
    description: string;
}
