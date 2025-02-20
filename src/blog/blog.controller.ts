import { Controller, Post, Get, Param, Body, Put, Delete, UseGuards, UploadedFile, UseInterceptors, Req } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { AuthGuard } from '../middleware/auth.middleware';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, Multer } from 'multer';
import { Request } from 'express';

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
    }),
  }))
  async create(@Body() createBlogDto: CreateBlogDto, @UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (file) createBlogDto.image = `/uploads/${file.filename}`;
    return this.blogService.create(createBlogDto, req.user.userId);
  }

  @Get()
  async findAll() {
    return this.blogService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('myblogs')
  async findByUser(@Req() req: Request) {
    return this.blogService.findByUser(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.update(id, updateBlogDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
