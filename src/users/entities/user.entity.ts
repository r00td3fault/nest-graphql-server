import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
@ObjectType()
export class User {

  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ type: 'varchar' })
  @Field(() => String)
  fullName: string;

  @Column({ type: 'varchar', unique: true })
  @Field(() => String)
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({
    type: 'text',
    array: true,
    default: ['user']
  })
  @Field(() => [String])
  roles: string[];

  @Column({ type: 'boolean', default: true })
  @Field(() => Boolean)
  isActive: boolean;

  @ManyToOne(
    () => User,
    user => user.lastUpdatedBy,
    { nullable: true, lazy: true }
  )
  @JoinColumn({ name: 'lastUpdatedBy' })
  @Field(() => User, { nullable: true })
  lastUpdatedBy?: User
}
