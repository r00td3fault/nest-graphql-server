import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ListItem } from '../../list-item/entities/list-item.entity';

@Entity({ name: 'lists' })
@ObjectType()
export class List {

  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ type: 'varchar' })
  @Field(() => String)
  name: string;

  @ManyToOne(() => User, user => user.lists, { nullable: false, lazy: true })
  @Index('userList-index')
  @Field(() => User)
  user: User;

  @OneToMany(() => ListItem, listItem => listItem.list, { lazy: true })
  // @Field(() => [ListItem])
  listItems?: ListItem[]
}
