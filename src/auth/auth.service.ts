
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { SignInResponseDto } from './dto/sign-in-response.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async signIn(
        email: string,
        pass: string,
    ): Promise<SignInResponseDto> {
        const user: User = await this.usersService.findUserByEmail(email);
        if (!user) {
            throw new UnauthorizedException();
        }

        const isPasswordValid = await bcrypt.compare(pass, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { id: user.id, email: user.email };
        return {
            access_token: await this.jwtService.signAsync(payload, { expiresIn: '7d' }),
        };
    }
}
