import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { RegisterDto } from './auth/dto/register.dto';
import { LoginDto } from './auth/dto/login.dto';
import { AuthGuard } from './middleware/auth.middleware';
import { ExecutionContext } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(dto => ({
      userId: 'test-user-id',
      ...dto,
    })),
    login: jest.fn(dto => ({
      accessToken: 'test-access-token',
      user: { email: dto.email, userId: 'test-user-id' },
    })),
    getProfile: jest.fn(userId => ({
      userId,
      name: 'Test User',
      email: 'test@example.com',
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should register a user', async () => {
      const registerDto: RegisterDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authController.register(registerDto);

      expect(result).toEqual({
        userId: 'test-user-id',
        ...registerDto,
      });
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login a user and return an access token', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authController.login(loginDto);

      expect(result).toEqual({
        accessToken: 'test-access-token',
        user: { email: 'test@example.com', userId: 'test-user-id' },
      });
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      const req = { user: { userId: 'test-user-id' } } as any;

      const result = await authController.getProfile(req);

      expect(result).toEqual({
        userId: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
      });
      expect(mockAuthService.getProfile).toHaveBeenCalledWith('test-user-id');
    });
  });
});
