import { InputType, Field, Float } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

@InputType()
export class CreateItemInput {

  @Field(() => String, { name: 'name' })
  @IsString()
  @MinLength(3)
  name: string;


  @Field(() => Float, { name: 'quantity' })
  @IsNumber()
  @Min(1)
  quantity: number;


  @Field(() => String, { name: 'quantityUnits', nullable: true })
  @IsString()
  @IsOptional()
  quantityUnits?: string;
}
