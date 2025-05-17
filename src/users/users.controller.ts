import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiSecurity } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: CreateUserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiSecurity('access-token')
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiResponse({ status: 200, description: 'List of users retrieved successfully', type: [CreateUserResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Query() query: any,
  ): Promise<CreateUserResponseDto[]> {
    const { page = 1, limit = 10 } = query;
    return this.usersService.findAll(page, limit);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiSecurity('access-token')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'ID of the user', example: 1 })
  @ApiResponse({ status: 200, description: 'User retrieved successfully', type: CreateUserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string): Promise<CreateUserResponseDto> {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiSecurity('access-token')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiParam({ name: 'id', description: 'ID of the user', example: 1 })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: CreateUserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() updateUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiSecurity('access-token')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'id', description: 'ID of the user', example: 1 })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string): Promise<{ status: string }> {
    return this.usersService.remove(+id);
  }
}
