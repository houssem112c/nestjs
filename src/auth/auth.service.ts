import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';  // Import ObjectId for type definition
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto): Promise<{ token: string }> {
    const existingUser = await this.userModel.findOne({ email: registerDto.email });
    if (existingUser) throw new BadRequestException('Email already in use');

    const user = new this.userModel(registerDto);
    await user.save();

    // Cast _id to string explicitly
    return { token: this.generateToken((user._id as ObjectId).toString()) };  // Ensure _id is treated as an ObjectId and cast it to string
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const user = await this.userModel.findOne({ email: loginDto.email }).exec();
  
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
  
    // Log user to check the type and methods
    console.log(user); // Log the object to check its structure and methods
  
    // Explicitly cast the user to UserDocument
    const userDoc = user as UserDocument;
  
    // Check if comparePassword is available
    if (!userDoc.comparePassword) {
      throw new UnauthorizedException('Invalid credentials - comparePassword not found');
    }
  
    // Call the comparePassword method
    if (!(await userDoc.comparePassword(loginDto.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
  
    return { token: this.generateToken((user._id as ObjectId).toString()) };
  }
  
  
  

  private generateToken(userId: string): string {
    return this.jwtService.sign({ userId });  // Ensure 'userId' is part of the payload
  }
  

  async getProfile(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) throw new BadRequestException('User not found');
    return user;
  }
}
