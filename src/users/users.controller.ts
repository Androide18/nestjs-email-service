import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseIntPipe,
  ValidationPipe,
  ForbiddenException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/auth.interface';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

//@ decorators are centrally functions prefixes with the @ symbol
// that accept a single argument and return a new function that replaces the original one.
@ApiTags('users')
@ApiBearerAuth() // Require Bearer token
@Controller('users') // this handle the /users route
export class UsersController {
  /*
    GET /users
    GET /users/:id
    POST /users
    PATCH /users/:id
    DELETE /users/:id
    */

  constructor(private readonly usersService: UsersService) {}

  // This run as a waterfall of routes
  // 🔐 Only ADMINs can access this route
  @UseGuards(JwtAuthGuard) // ensures the user is authenticated
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['USER', 'ADMIN'],
    description: 'Filter users by role',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiForbiddenResponse({ description: 'Forbidden - only admins allowed' })
  @Get() // GET /users or /users?role=value - filter by query params
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query('role') role?: 'USER' | 'ADMIN',
  ) {
    const user = req.user;

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can access this route.');
    }

    return this.usersService.findAll(role);
  }

  @Get(':id') // GET /users/:id
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post('/signup') // POST /users
  create(
    @Body(ValidationPipe)
    createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id') // PATCH /users/:id
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe)
    updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id') // DELETE /users/:id
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(id);
  }
}

/* NOTE:  ParseIntPipe to convert string to number - Is a Validator
if you type a string in the url, it will throw an error
transform AND validate

ValidationPipe - Validates against the DTO
*/
