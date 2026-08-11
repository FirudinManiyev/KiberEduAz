import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  ContentAccent,
  ContentStatus,
  Difficulty,
  QuestionType,
  RoomType,
} from '@prisma/client';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class LessonSectionDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  heading?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  body!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  @MaxLength(500, { each: true })
  bullets?: string[];
}

export class UpsertPathDto {
  @Matches(SLUG_PATTERN, { message: 'slug yalnız kiçik hərf, rəqəm və tire ola bilər' })
  @MaxLength(80)
  slug!: string;

  @IsString() @MinLength(2) @MaxLength(160) title!: string;
  @IsOptional() @IsString() @MaxLength(1000) description?: string;
  @IsOptional() @IsString() @MaxLength(5000) intro?: string;
  @IsOptional() @IsString() @MaxLength(500) imageUrl?: string;
  @IsOptional() @IsString() @MaxLength(80) category?: string;
  @IsOptional() @IsEnum(ContentStatus) status?: ContentStatus;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) orderIndex?: number;
}

export class UpsertModuleDto {
  @IsUUID() pathId!: string;

  @Matches(SLUG_PATTERN)
  @MaxLength(80)
  slug!: string;

  @IsString() @MinLength(2) @MaxLength(160) title!: string;
  @IsOptional() @IsString() @MaxLength(1000) description?: string;
  @IsOptional() @IsEnum(ContentStatus) status?: ContentStatus;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) orderIndex?: number;
}

export class UpsertRoomDto {
  @IsUUID() moduleId!: string;

  @Matches(SLUG_PATTERN)
  @MaxLength(80)
  slug!: string;

  @IsString() @MinLength(2) @MaxLength(160) title!: string;
  @IsOptional() @IsString() @MaxLength(160) shortTitle?: string;
  @IsOptional() @IsString() @MaxLength(160) eyebrow?: string;
  @IsOptional() @IsString() @MaxLength(1000) description?: string;
  @IsOptional() @IsString() @MaxLength(80) category?: string;
  @IsOptional() @IsEnum(RoomType) type?: RoomType;
  @IsOptional() @IsEnum(Difficulty) difficulty?: Difficulty;
  @IsOptional() @IsString() @MaxLength(60) durationLabel?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100000) points?: number;
  @IsOptional() @IsEnum(ContentAccent) accent?: ContentAccent;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(12)
  @MaxLength(300, { each: true })
  objectives?: string[];

  @IsOptional() @IsString() @MaxLength(200) sourceFile?: string;
  @IsOptional() @IsEnum(ContentStatus) status?: ContentStatus;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) orderIndex?: number;
}

export class UpsertQuestionDto {
  @IsOptional() @IsEnum(QuestionType) type?: QuestionType;

  @IsString() @MinLength(3) @MaxLength(1000) prompt!: string;
  @IsOptional() @IsString() @MaxLength(2000) explanation?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(10000) points?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) orderIndex?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertQuestionOptionDto)
  @ArrayMaxSize(10)
  options?: UpsertQuestionOptionDto[];

  /// Case-insensitive accepted values for SHORT_ANSWER questions.
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  @MaxLength(200, { each: true })
  acceptedAnswers?: string[];
}

export class UpsertQuestionOptionDto {
  @IsString() @MinLength(1) @MaxLength(500) label!: string;
  @IsBoolean() isCorrect!: boolean;
}

export class UpsertTaskDto {
  @IsString() @MinLength(2) @MaxLength(200) title!: string;
  @IsOptional() @IsString() @MaxLength(60) durationLabel?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(10000) points?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) orderIndex?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonSectionDto)
  @ArrayMaxSize(30)
  sections?: LessonSectionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertQuestionDto)
  @ArrayMaxSize(20)
  questions?: UpsertQuestionDto[];
}

export class RoomQueryDto {
  @IsOptional() @IsString() @MaxLength(120) search?: string;
  @IsOptional() @IsString() @MaxLength(80) category?: string;
  @IsOptional() @IsEnum(RoomType) type?: RoomType;
  @IsOptional() @IsEnum(Difficulty) difficulty?: Difficulty;

  /// Teachers and admins can additionally ask for drafts.
  @IsOptional() @IsEnum(ContentStatus) status?: ContentStatus;
}
