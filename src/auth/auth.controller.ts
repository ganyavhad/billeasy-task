import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignInResponseDto } from './dto/sign-in-response.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    @ApiOperation({ summary: 'User login' })
    @ApiBody({ type: SignInDto })
    @ApiResponse({
        status: 200,
        description: 'User successfully logged in',
        type: SignInResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid credentials',
    })
    signIn(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
        return this.authService.signIn(signInDto.email, signInDto.password);
    }
}
