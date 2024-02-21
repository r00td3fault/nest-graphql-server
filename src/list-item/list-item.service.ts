import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ListItem } from './entities/list-item.entity';

import { CreateListItemInput } from './dto/inputs/create-list-item.input';
import { UpdateListItemInput } from './dto/inputs/update-list-item.input';
import { Repository } from 'typeorm';
import { List } from '../list/entities/list.entity';
import { PaginationArgs } from '../common/dto/args/pagination.args';
import { SearchArgs } from '../common/dto/args/search.args';


@Injectable()
export class ListItemService {

  private logger: Logger;

  constructor(
    @InjectRepository(ListItem)
    private readonly listItemRespository: Repository<ListItem>
  ) { }


  async create(createListItemInput: CreateListItemInput): Promise<ListItem> {

    try {
      const { itemId, listId, ...rest } = createListItemInput;
      const newListItem = this.listItemRespository.create({
        ...rest,
        item: { id: itemId },
        list: { id: listId },
      });

      await this.listItemRespository.save(newListItem);

      return this.findOne(newListItem.id);

    } catch (error) {
      this.handleDBErrors(error);
    }

  }

  async findAll(list: List, paginationArgs: PaginationArgs, searchArgs: SearchArgs): Promise<ListItem[]> {

    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;


    const queryBuilder = this.listItemRespository.createQueryBuilder('listItem')
      .innerJoin('listItem.item', 'item')
      .take(limit)
      .skip(offset)
      .where(`"listId" = :listId`, { listId: list.id });

    if (search) {
      queryBuilder.andWhere('LOWER(item.name) like :name', { name: `%${search.toLowerCase()}%` })
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<ListItem> {
    const listItem = await this.listItemRespository.findOneBy({ id });

    if (!listItem) throw new NotFoundException(`List item with id ${id} not found`);

    return listItem;
  }

  async update(id: string, updateListItemInput: UpdateListItemInput): Promise<ListItem> {
    const { itemId, listId, ...rest } = updateListItemInput;

    try {

      const queryBuilder = this.listItemRespository.createQueryBuilder()
        .update(ListItem)
        .set({
          ...rest,
          ...(listId && { list: { id: listId } }),
          ...(itemId && { item: { id: itemId } }),
        })
        .where("id = :id", { id });

      await queryBuilder.execute();

      return await this.findOne(id);


    } catch (error) {
      this.handleDBErrors(error);
    }

  }

  remove(id: number) {
    return `This action removes a #${id} listItem`;
  }

  async countListItemByList(list: List) {
    return this.listItemRespository.countBy({
      list: { id: list.id }
    });
  }

  private handleDBErrors(error: any): never {

    if (error.code === '23505') {
      throw new BadRequestException(error.detail.replace('Key', ''));
    }
    console.log(error);
    this.logger.error(error);

    throw new InternalServerErrorException(`Algo salió mal`);

  }
}
