import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPlan } from '../../../entities/tenant.entity';

export class UpgradePlanDto {
    @ApiProperty({
        description: 'New subscription plan',
        enum: SubscriptionPlan,
        example: SubscriptionPlan.PROFESSIONAL,
    })
    @IsEnum(SubscriptionPlan)
    plan: SubscriptionPlan;
}
