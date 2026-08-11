import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(120) fullName?: string;

  @IsOptional()
  @Matches(/^[a-z0-9._-]{3,32}$/, {
    message: 'İstifadəçi adı 3-32 simvol, kiçik hərf, rəqəm, nöqtə, tire ola bilər',
  })
  username?: string;

  @IsOptional() @IsString() @MaxLength(40) avatarKey?: string;
  @IsOptional() @IsString() @MaxLength(600) bio?: string;
  @IsOptional() @IsString() @MaxLength(160) institutionName?: string;
  @IsOptional() @IsString() @MaxLength(80) classLabel?: string;
  @IsOptional() @IsString() @MaxLength(40) focusTrack?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) weeklyGoal?: number;

  @IsOptional() @IsBoolean() notifyNewRooms?: boolean;
  @IsOptional() @IsBoolean() notifyStreak?: boolean;
  @IsOptional() @IsBoolean() notifyLeaderboard?: boolean;
}

/// Admin-only. Roles are deliberately not part of UpdateProfileDto so a learner
/// can never promote themselves by adding a field to the request body.
export class ChangeRoleDto {
  @IsEnum(UserRole) role!: UserRole;
}
