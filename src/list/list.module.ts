import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ListService } from './list.service';
import { ListResolver } from './list.resolver';

import { List } from './entities/list.entity';
import { ListItemModule } from '../list-item/list-item.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([List]),
    ListItemModule,
  ],
  providers: [ListResolver, ListService],
  exports: [
    ListService,
    TypeOrmModule
  ]
})
export class ListModule { }
