import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { List } from '../../list/entities/list.entity';
import { Item } from '../../items/entities/item.entity';

@Entity({ name: 'listItems' })
@Unique('listItem-item', ['list', 'item'])
@ObjectType()
export class ListItem {

  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ type: 'numeric' })
  @Field(() => Number)
  quantity: number;

  @Column({ type: 'boolean' })
  @Field(() => Boolean)
  completed: boolean;

  @ManyToOne(() => List, list => list.listItems, { lazy: true })
  @Field(() => List)
  list: List;

  @ManyToOne(() => Item, item => item.listItems, { lazy: true })
  @Field(() => Item)
  item: Item;
}
