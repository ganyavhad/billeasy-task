import { ApiProperty } from '@nestjs/swagger';

export class SignInResponseDto {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'The JWT access token for the authenticated user',
    })
    access_token: string;
}
