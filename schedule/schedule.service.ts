import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ISchedule } from 'interface/Model/ISchedule';
import { FilterQuery, Model } from 'mongoose';
import { GenericService } from 'src/adhoc/generic.service';
import { ScheduleDto } from 'src/dataObjects/dto/schedule.dto';
import { Schedule } from 'src/dataObjects/schema/schedule.schema';

@Injectable()
export class ScheduleService extends GenericService<
  ScheduleDto,
  Schedule
> {
  deleteOne(ScheduleQuery: FilterQuery<ISchedule>, uuid: string) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectModel(Schedule.name) ScheduleModel: Model<Schedule>,
  ) {
    super(ScheduleModel);
  }
}
