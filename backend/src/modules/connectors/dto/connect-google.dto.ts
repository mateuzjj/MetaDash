import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConnectGoogleDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  propertyIds?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  managerAccountId?: string;
}
