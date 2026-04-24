import { Transform } from "class-transformer";
import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePostDto {
@IsNotEmpty()
@IsString()
title: string;
    
@Transform(({ value }) => (Array.isArray(value) ? value : [value]))
@IsArray()
@IsOptional()
@IsString({ each: true })
tags: string[];
}
