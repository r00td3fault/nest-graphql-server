import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SEED_USERS, SEED_ITEMS, SEED_LIST } from './data/seed-data';

import { User } from '../users/entities/user.entity';
import { Item } from '../items/entities/item.entity';
import { ListItem } from '../list-item/entities/list-item.entity';
import { List } from '../list/entities/list.entity';

import { UsersService } from '../users/users.service';
import { ItemsService } from '../items/items.service';

@Injectable()
export class SeedService {

    private isProd: boolean;

    constructor(

        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,

        @InjectRepository(Item)
        private readonly itemsRepository: Repository<Item>,

        @InjectRepository(ListItem)
        private readonly listItemsRepository: Repository<ListItem>,

        @InjectRepository(List)
        private readonly listRepository: Repository<List>,

        private readonly configServvice: ConfigService,
        private readonly usersService: UsersService,
        private readonly itemsService: ItemsService,
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

        // create list
        const lists = await this.loadList(user);

        // create list items
        const items = await this.itemsService.findAll(user, { limit: 20 }, {});
        console.log(lists, items);
        await this.loadListItems(lists, items);
        return true;
    }

    async deleteDatabase(): Promise<void> {

        await this.listItemsRepository.delete({});
        await this.listRepository.delete({});


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

    async loadList(user: User): Promise<List[]> {
        const list = SEED_LIST.map(list => this.listRepository.create({
            ...list,
            user
        }));

        return await this.listRepository.save(list);
    }

    async loadListItems(lists: List[], items: Item[]): Promise<void> {

        const listItems = items.map(item => {
            const itemIndx = Math.floor(Math.random() * items.length);
            const listIndx = Math.floor(Math.random() * lists.length);
            return this.listItemsRepository.create(
                {
                    item: { id: item.id },
                    list: { id: lists[listIndx].id },
                    quantity: itemIndx,
                    completed: itemIndx % 2 === 0,
                }
            );
        });

        await this.listItemsRepository.save(listItems);
    }
}
