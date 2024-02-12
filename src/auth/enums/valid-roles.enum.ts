import { registerEnumType } from "@nestjs/graphql";


export enum ValidRoles {
    user = 'user',
    admin = 'admin',
    superUser = 'superUser',
}

registerEnumType(ValidRoles, { name: 'validRoles' });