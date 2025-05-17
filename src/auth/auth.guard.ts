import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    private readonly logger = new Logger(AuthGuard.name);

    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers['authorization'];

        if (!token) {
            this.logger.warn('Authorization token is missing');
            throw new UnauthorizedException();
        }

        try {
            this.logger.debug('Verifying JWT token');
            const payload = await this.jwtService.verifyAsync(
                token.split(' ')[1],
                {
                    secret: process.env.JWT_SECRET,
                },
            );
            this.logger.debug(`JWT token verified successfully for user: ${payload.email}`);
            request['user'] = payload;
        } catch (error) {
            this.logger.error('JWT token verification failed', error.stack);
            throw new UnauthorizedException();
        }

        return true;
    }
}
