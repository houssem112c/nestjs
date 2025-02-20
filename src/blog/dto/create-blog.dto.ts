import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsNotEmpty()
  @IsString()
  category: 'Scientific' | 'IT';

  @IsOptional()
  @IsString()
  image?: string;
}
