import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GenericSchema } from './generic.schema';
import { v4 } from 'uuid';

@Schema()
export class Schedule extends GenericSchema {
  static findOne(arg0: { uuid: string; ScheduleId: string; isBooked: boolean; }) {
    throw new Error('Method not implemented.');
  }
  static findOneAndDelete(arg0: { uuid: string; ScheduleId: string; }) {
    throw new Error('Method not implemented.');
  }

  @Prop()
  duration?: number;

  // @Prop({required:true})

  @Prop()
  startDate?: string;

  @Prop()
  endDate?: string;
  
  @Prop()
  inputs:{
    start: string;
    end: string;
    duration: number;
  }[];

  @Prop()
  schedule:any[];

  @Prop()
  ScheduleId:string;

}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
