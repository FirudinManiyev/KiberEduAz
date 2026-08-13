import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateClassDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  academicYear?: string;
}

export class AddStudentByEmailDto {
  @IsEmail()
  email!: string;
}
