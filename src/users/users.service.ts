import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

import { UpdateUserInput } from './dto/update-user.input';

import { SignupInput } from '../auth/dto/inputs/singup.input';

@Injectable()
export class UsersService {

  private logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>

  ) { }

  async create(signupInput: SignupInput): Promise<User> {
    try {
      const newUser = this.usersRepository.create({
        ...signupInput,
        password: bcrypt.hashSync(signupInput.password, 10),
      });
      return await this.usersRepository.save(newUser);

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOneBy({ email });
      if (!user) throw new NotFoundException(`User with email: ${email} not found`);
      return user;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findOneById(userId: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOneBy({ id: userId });
      if (!user) throw new NotFoundException(`User with id: ${userId} not found`);
      return user;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  update(id: string, updateUserInput: UpdateUserInput) {
    return {};
  }

  async block(id: string): Promise<User> {
    throw new Error('')
  }

  private handleDBErrors(error: any): never {

    if (error.code === '23505') {
      throw new BadRequestException(error.detail.replace('Key', ''));
    }

    this.logger.error(error);

    throw new InternalServerErrorException(`Algo salió mal`);

  }
}
