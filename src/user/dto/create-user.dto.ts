import {IsEmail, IsNotEmpty, MaxLength } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(51)
    email: string;
}
