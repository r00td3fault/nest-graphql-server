import { Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity';
import { Item } from '../items/entities/item.entity';
import { UsersService } from '../users/users.service';
import { SEED_USERS, SEED_ITEMS } from './data/seed-data';

@Injectable()
export class SeedService {

    private isProd: boolean;

    constructor(
        private readonly configServvice: ConfigService,
        private readonly usersService: UsersService,

        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,

        @InjectRepository(Item)
        private readonly itemsRepository: Repository<Item>,
    ) {
        this.isProd = configServvice.get('STATE') === 'prod';
    }


    async executeSeed() {

        if (this.isProd) {
            throw new BadRequestException('We can not run SEED on prod');
        }

        // delete all
        await this.deleteDatabase();

        // create user
        const user = await this.loadUsers();

        // create items
        await this.loadItems(user);

        return true;
    }

    async deleteDatabase(): Promise<void> {

        await this.itemsRepository.delete({});
        await this.usersRepository.delete({});
    }

    async loadUsers(): Promise<User> {

        const users = await Promise.all(SEED_USERS.map(async user => await this.usersService.create(user)));

        return users[0];
    }


    async loadItems(user: User): Promise<void> {
        const items = SEED_ITEMS.map(item => this.itemsRepository.create({
            ...item,
            user
        }));

        await this.itemsRepository.save(items);
    }
}
