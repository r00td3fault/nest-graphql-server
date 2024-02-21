import { Resolver, Query, Mutation, Args, Int, ID, ResolveField, Parent } from '@nestjs/graphql';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';

import { ListService } from './list.service';
import { UpdateListInput, CreateListInput } from './dto/inputs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationArgs, SearchArgs } from '../common/dto/args';

import { List } from './entities/list.entity';
import { User } from '../users/entities/user.entity';
import { ListItem } from '../list-item/entities/list-item.entity';
import { ListItemService } from '../list-item/list-item.service';
import { ValidRoles } from '../auth/enums/valid-roles.enum';

@Resolver(() => List)
@UseGuards(JwtAuthGuard)
export class ListResolver {
  constructor(
    private readonly listService: ListService,
    private readonly listItemService: ListItemService
  ) { }

  @Mutation(() => List)
  async createList(
    @Args('createListInput') createListInput: CreateListInput,
    @CurrentUser() user: User,
  ): Promise<List> {
    return this.listService.create(createListInput, user);
  }

  @Query(() => [List], { name: 'lists' })
  async findAll(
    @CurrentUser() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs
  ): Promise<List[]> {
    return this.listService.findAll(user, paginationArgs, searchArgs);
  }

  @Query(() => List, { name: 'list' })
  async findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<List> {
    return this.listService.findOne(id, user);
  }

  @Mutation(() => List)
  async updateList(
    @Args('updateListInput') updateListInput: UpdateListInput,
    @CurrentUser() user: User,
  ): Promise<List> {
    return this.listService.update(updateListInput.id, updateListInput, user);
  }

  @Mutation(() => List)
  async removeList(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<List> {
    return this.listService.remove(id, user);
  }


  @ResolveField(() => [ListItem], { name: 'items' })
  async getListItems(
    @CurrentUser([ValidRoles.admin]) adminUser: User,
    @Parent() list: List,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<ListItem[]> {
    return this.listItemService.findAll(list, paginationArgs, searchArgs);
  }

  @ResolveField(() => Int, { name: 'totalItems' })
  async countListItemByList(
    @Parent() list: List,
  ): Promise<number> {
    return this.listItemService.countListItemByList(list);
  }

}
