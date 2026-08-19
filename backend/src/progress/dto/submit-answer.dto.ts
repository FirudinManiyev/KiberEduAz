import { ArrayMaxSize, IsArray, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/// Learners answer by option id rather than index, so reordering a question's
/// options can never silently change what a stored attempt meant.
export class SubmitAnswerDto {
  @IsOptional()
  @IsUUID()
  optionId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUUID(undefined, { each: true })
  optionIds?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(300)
  text?: string;
}
