import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserResponseDto } from './dto/create-user-response.dto';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
    try {
      const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
      if (existingUser) {
        throw new Error('User already exists');
      }

      const userEntity = new User();
      userEntity.email = createUserDto.email;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
      userEntity.password = hashedPassword;

      const user: User = await this.usersRepository.save(userEntity);
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw error
    }
  }


  async findUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ where: { email } });
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw error
    }
  }

  async findAll(page: number, limit: number): Promise<CreateUserResponseDto[]> {
    try {
      const users: User[] = await this.usersRepository.find({
        skip: (page - 1) * limit,
        take: limit
      });
      const usersWithoutPassword = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      return usersWithoutPassword;
    } catch (error) {
      throw error
    }
  }

  async findOne(id: number): Promise<CreateUserResponseDto> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });

      if (!user) {
        throw new HttpException('User not found', 404);
      }
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw error
    }
  }

  async update(id: number, updateUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        throw new HttpException('User not found', 404);
      }
      const updatedUser = await this.usersRepository.save({ ...user, ...updateUserDto });
      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      throw error
    }
  }

  async remove(id: number): Promise<{ status: string }> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        throw new HttpException('User not found', 404);
      }
      await this.usersRepository.remove(user);
      return { status: 'success' };
    } catch (error) {
      throw error
    }
  }
}
