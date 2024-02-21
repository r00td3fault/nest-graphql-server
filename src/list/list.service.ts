import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { List } from './entities/list.entity';
import { User } from '../users/entities/user.entity';

import { CreateListInput, UpdateListInput } from './dto/inputs';
import { PaginationArgs, SearchArgs } from '../common/dto/args';

@Injectable()
export class ListService {

  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>
  ) { }
  async create(createListInput: CreateListInput, user: User): Promise<List> {
    const newList = this.listRepository.create({
      ...createListInput,
      user
    });

    return await this.listRepository.save(newList);
  }

  async findAll(user: User, paginationArgs: PaginationArgs, searchArgs: SearchArgs): Promise<List[]> {

    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;


    const queryBuilder = this.listRepository.createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"userId" = :userId`, { userId: user.id });

    if (search) {
      queryBuilder.andWhere('LOWER(name) like :name', { name: `%${search.toLowerCase()}%` })
    }

    return queryBuilder.getMany()
  }

  async findOne(id: string, user: User) {
    const list = await this.listRepository.findOneBy({
      id,
      user: { id: user.id }
    });

    if (!list) throw new NotFoundException(`List with id ${id} not found`);
    return list;
  }

  async update(id: string, updateListInput: UpdateListInput, user: User): Promise<List> {
    await this.findOne(id, user);
    const list = await this.listRepository.preload({ ...updateListInput, user });

    return this.listRepository.save(list);
  }

  async remove(id: string, user: User): Promise<List> {
    const list = await this.findOne(id, user);
    await this.listRepository.delete(list.id);
    return { ...list, id }
  }


  async listCountByUser(user: User): Promise<number> {
    return this.listRepository.countBy({
      user: {
        id: user.id
      }
    });
  }
}
