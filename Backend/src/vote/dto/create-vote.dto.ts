import { IsEnum } from "class-validator";
import { VoteType } from "../vote.entity";

export class CreateVoteDto {
    
  @IsEnum(VoteType)
  type: VoteType;
    
}