import { ApiProperty } from '@nestjs/swagger';

export class CreateUserResponseDto {
    @ApiProperty({
        example: 1,
        description: 'The unique identifier of the user',
    })
    id: number;

    @ApiProperty({
        example: 'user@example.com',
        description: 'The email of the user',
    })
    email: string;

    @ApiProperty({
        example: '2025-05-17T12:00:00Z',
        description: 'The date and time when the user was created',
    })
    created_at: Date;
}
