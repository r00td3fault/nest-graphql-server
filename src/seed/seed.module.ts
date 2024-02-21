import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SeedService } from './seed.service';
import { SeedResolver } from './seed.resolver';

import { UsersModule } from '../users/users.module';
import { ItemsModule } from '../items/items.module';
import { ListModule } from 'src/list/list.module';
import { ListItemModule } from '../list-item/list-item.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    ItemsModule,
    ListModule,
    ListItemModule
  ],
  providers: [SeedResolver, SeedService],
})
export class SeedModule { }
