import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateListInput {
  @Field(() => String, { name: 'name', description: 'List name' })
  @IsNotEmpty()
  @IsString()
  name: string;
}
