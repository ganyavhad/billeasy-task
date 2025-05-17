import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { SignInResponseDto } from './dto/sign-in-response.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async signIn(
        email: string,
        pass: string,
    ): Promise<SignInResponseDto> {
        this.logger.debug(`Attempting to sign in user with email: ${email}`);

        const user: User = await this.usersService.findUserByEmail(email);
        if (!user) {
            this.logger.warn(`User with email ${email} not found`);
            throw new UnauthorizedException();
        }

        const isPasswordValid = await bcrypt.compare(pass, user.password);
        if (!isPasswordValid) {
            this.logger.warn(`Invalid credentials for user with email: ${email}`);
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { id: user.id, email: user.email };
        const token = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

        this.logger.debug(`User with email ${email} signed in successfully`);
        return {
            access_token: token,
        };
    }
}
