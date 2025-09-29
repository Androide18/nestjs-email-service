import {
  IsEmail,
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  firstname: string;

  @IsString()
  @IsOptional()
  lastname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsEnum(['USER', 'ADMIN'], {
    message: 'Valid role required',
  })
  role: 'USER' | 'ADMIN';
}
