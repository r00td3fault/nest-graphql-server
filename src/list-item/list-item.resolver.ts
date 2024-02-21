import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';

import { ListItem } from './entities/list-item.entity';
import { User } from '../users/entities/user.entity';

import { ListItemService } from './list-item.service';

import { CreateListItemInput } from './dto/inputs/create-list-item.input';
import { UpdateListItemInput } from './dto/inputs/update-list-item.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';
import { ValidRoles } from '../auth/enums/valid-roles.enum';

@Resolver(() => ListItem)
export class ListItemResolver {
  constructor(private readonly listItemService: ListItemService) { }

  @Mutation(() => ListItem)
  @UseGuards(JwtAuthGuard)
  async createListItem(
    @Args('createListItemInput') createListItemInput: CreateListItemInput,
    @CurrentUser() user: User,
  ): Promise<ListItem> {
    return this.listItemService.create(createListItemInput);
  }

  // @Query(() => [ListItem], { name: 'listItem' })
  // async findAll(
  //   @CurrentUser([ValidRoles.admin]) adminUser: User,
  //   @Args() paginationArgs: PaginationArgs,
  //   @Args() searchArgs: SearchArgs,
  // ): Promise<ListItem> {
  //   return this.listItemService.findAll();
  // }

  @Query(() => ListItem, { name: 'listItem' })
  async findOne(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string
  ): Promise<ListItem> {
    return this.listItemService.findOne(id);
  }

  @Mutation(() => ListItem)
  async updateListItem(
    @Args('updateListItemInput') updateListItemInput: UpdateListItemInput
  ): Promise<ListItem> {
    return this.listItemService.update(updateListItemInput.id, updateListItemInput);
  }

  // @Mutation(() => ListItem)
  // removeListItem(@Args('id', { type: () => Int }) id: number) {
  //   return this.listItemService.remove(id);
  // }
}
