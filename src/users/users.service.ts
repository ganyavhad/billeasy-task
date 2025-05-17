import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserResponseDto } from './dto/create-user-response.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
    this.logger.debug(`Creating user with email: ${createUserDto.email}`);
    try {
      const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
      if (existingUser) {
        this.logger.warn(`User with email ${createUserDto.email} already exists`);
        throw new HttpException('User already exists', 409);
      }

      const userEntity = new User();
      userEntity.email = createUserDto.email;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
      userEntity.password = hashedPassword;

      const user: User = await this.usersRepository.save(userEntity);
      this.logger.debug(`User created successfully with ID: ${user.id}`);
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      this.logger.error(`Failed to create user with email: ${createUserDto.email}`, error.stack);
      throw error;
    }
  }

  async findUserByEmail(email: string): Promise<User> {
    this.logger.debug(`Finding user by email: ${email}`);
    try {
      const user = await this.usersRepository.findOne({ where: { email } });
      if (!user) {
        this.logger.warn(`User with email ${email} not found`);
        throw new Error('User not found');
      }
      this.logger.debug(`User with email ${email} found`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to find user by email: ${email}`, error.stack);
      throw error;
    }
  }

  async findAll(page: number, limit: number): Promise<CreateUserResponseDto[]> {
    this.logger.debug(`Fetching all users with page: ${page}, limit: ${limit}`);
    try {
      const users: User[] = await this.usersRepository.find({
        skip: (page - 1) * limit,
        take: limit,
      });
      this.logger.debug(`Fetched ${users.length} users`);
      const usersWithoutPassword = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      return usersWithoutPassword;
    } catch (error) {
      this.logger.error('Failed to fetch users', error.stack);
      throw error;
    }
  }

  async findOne(id: number): Promise<CreateUserResponseDto> {
    this.logger.debug(`Finding user with ID: ${id}`);
    try {
      const user = await this.usersRepository.findOne({ where: { id } });

      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new HttpException('User not found', 404);
      }
      this.logger.debug(`User with ID ${id} found`);
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      this.logger.error(`Failed to find user with ID: ${id}`, error.stack);
      throw error;
    }
  }

  async update(id: number, updateUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
    this.logger.debug(`Updating user with ID: ${id}`);
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new HttpException('User not found', 404);
      }
      const updatedUser = await this.usersRepository.save({ ...user, ...updateUserDto });
      this.logger.debug(`User with ID ${id} updated successfully`);
      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      this.logger.error(`Failed to update user with ID: ${id}`, error.stack);
      throw error;
    }
  }

  async remove(id: number): Promise<{ status: string }> {
    this.logger.debug(`Removing user with ID: ${id}`);
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new HttpException('User not found', 404);
      }
      await this.usersRepository.remove(user);
      this.logger.debug(`User with ID ${id} removed successfully`);
      return { status: 'success' };
    } catch (error) {
      this.logger.error(`Failed to remove user with ID: ${id}`, error.stack);
      throw error;
    }
  }
}
