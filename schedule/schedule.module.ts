import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Schedule,
  ScheduleSchema,
} from 'src/dataObjects/schema/schedule.schema';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { SlotModule } from '../slots/slot.module';
import { CommonServiceModule } from 'src/modules/commonService.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Schedule.name,
        schema: ScheduleSchema,
      },
    ]),
    SlotModule,
    CommonServiceModule,
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
