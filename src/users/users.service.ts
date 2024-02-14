import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

import { UpdateUserInput } from './dto/update-user.input';

import { SignupInput } from '../auth/dto/inputs/singup.input';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { PaginationArgs } from '../common/dto/args/pagination.args';
import { SearchArgs } from '../common/dto/args/search.args';

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

  async findAll(
    roles: ValidRoles[],
    paginatorArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<User[]> {

    const { limit, offset } = paginatorArgs;
    const { search } = searchArgs;

    try {

      const queryBuilder = this.usersRepository.createQueryBuilder('user')
        .take(limit)
        .skip(offset);

      if (roles.length !== 0) {
        queryBuilder.andWhere('ARRAY[roles] && ARRAY[:...roles]', { roles })
      }

      if (search) {
        queryBuilder.andWhere('LOWER("fullName") like :fullName', {
          fullName: `%${search.toLowerCase()}%`
        });
      }

      return queryBuilder.getMany();

    } catch (error) {
      this.handleDBErrors(error);
    }



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

  async update(id: string, updateUserInput: UpdateUserInput, adminUser: User): Promise<User> {

    try {

      const user = await this.usersRepository.preload({
        ...updateUserInput,
        id,
        password: (updateUserInput.password) ? bcrypt.hashSync(updateUserInput.password, 10) : undefined,
        lastUpdatedBy: adminUser
      })
      return await this.usersRepository.save(user);

    } catch (error) {
      this.handleDBErrors(error);
    }

  }

  async block(id: string, adminUser: User): Promise<User> {

    const userToBlock = await this.findOneById(id);

    userToBlock.isActive = false;
    userToBlock.lastUpdatedBy = adminUser;

    return await this.usersRepository.save(userToBlock);

  }

  private handleDBErrors(error: any): never {

    if (error.code === '23505') {
      throw new BadRequestException(error.detail.replace('Key', ''));
    }

    this.logger.error(error);

    throw new InternalServerErrorException(`Algo salió mal`);

  }
}
