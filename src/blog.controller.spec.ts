import { Test, TestingModule } from '@nestjs/testing';
import { BlogController } from './blog/blog.controller';
import { BlogService } from './blog/blog.service';
import { CreateBlogDto } from './blog/dto/create-blog.dto';
import { UpdateBlogDto } from './blog/dto/update-blog.dto';
import { AuthGuard } from './middleware/auth.middleware';
import { ExecutionContext } from '@nestjs/common';

describe('BlogController', () => {
  let blogController: BlogController;
  let blogService: BlogService;

  const mockBlogService = {
    create: jest.fn((dto, userId) => ({
      id: 'test-blog-id',
      userId,
      ...dto,
    })),
    findAll: jest.fn(() => [
      { id: '1', title: 'Blog 1', content: 'Content 1', category: 'IT' },
      { id: '2', title: 'Blog 2', content: 'Content 2', category: 'Scientific' },
    ]),
    findByUser: jest.fn(userId => [
      { id: '1', title: 'My Blog', content: 'Content', category: 'IT', userId },
    ]),
    findOne: jest.fn(id => ({ id, title: 'Blog 1', content: 'Content 1', category: 'IT' })),
    update: jest.fn((id, dto) => ({ id, ...dto })),
    remove: jest.fn(id => ({ message: `Blog ${id} deleted successfully` })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogController],
      providers: [
        {
          provide: BlogService,
          useValue: mockBlogService,
        },
      ],
    }).compile();

    blogController = module.get<BlogController>(BlogController);
    blogService = module.get<BlogService>(BlogService);
  });

  it('should be defined', () => {
    expect(blogController).toBeDefined();
  });

  describe('create', () => {
    it('should create a blog', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Test Blog',
        content: 'This is a test blog',
        tags: ['test', 'nestjs'],
        category: 'IT',
        image: '',
      };

      const req = { user: { userId: 'test-user-id' } } as any;
      const file = { filename: 'test-image.jpg' } as Express.Multer.File;

      const result = await blogController.create(createBlogDto, file, req);

      expect(result).toEqual({
        id: 'test-blog-id',
        userId: 'test-user-id',
        ...createBlogDto,
        image: '/uploads/test-image.jpg',
      });
      expect(mockBlogService.create).toHaveBeenCalledWith(
        { ...createBlogDto, image: '/uploads/test-image.jpg' },
        'test-user-id',
      );
    });
  });

  describe('findAll', () => {
    it('should return all blogs', async () => {
      const result = await blogController.findAll();

      expect(result).toEqual([
        { id: '1', title: 'Blog 1', content: 'Content 1', category: 'IT' },
        { id: '2', title: 'Blog 2', content: 'Content 2', category: 'Scientific' },
      ]);
      expect(mockBlogService.findAll).toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('should return blogs of the authenticated user', async () => {
      const req = { user: { userId: 'test-user-id' } } as any;

      const result = await blogController.findByUser(req);

      expect(result).toEqual([
        { id: '1', title: 'My Blog', content: 'Content', category: 'IT', userId: 'test-user-id' },
      ]);
      expect(mockBlogService.findByUser).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('findOne', () => {
    it('should return a single blog by id', async () => {
      const result = await blogController.findOne('1');

      expect(result).toEqual({
        id: '1',
        title: 'Blog 1',
        content: 'Content 1',
        category: 'IT',
      });
      expect(mockBlogService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a blog', async () => {
      const updateBlogDto: UpdateBlogDto = {
        title: 'Updated Blog',
        content: 'Updated content',
        tags: ['updated'],
        category: 'Scientific',
      };

      const result = await blogController.update('1', updateBlogDto);

      expect(result).toEqual({
        id: '1',
        ...updateBlogDto,
      });
      expect(mockBlogService.update).toHaveBeenCalledWith('1', updateBlogDto);
    });
  });

  describe('remove', () => {
    it('should delete a blog', async () => {
      const result = await blogController.remove('1');

      expect(result).toEqual({ message: 'Blog 1 deleted successfully' });
      expect(mockBlogService.remove).toHaveBeenCalledWith('1');
    });
  });
});
