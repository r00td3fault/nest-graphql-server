import { InputType, Int, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {

  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String)
  @IsString()
  fullName: string;

  @Field(() => String)
  @IsString()
  @MinLength(6)
  password: string;
}
