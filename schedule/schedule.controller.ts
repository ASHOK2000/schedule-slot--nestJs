import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { ISchedule } from 'interface/Model/ISchedule'
import { FilterQuery } from 'mongoose'
import { IController } from 'src/adhoc/IController'
import { ExpressJWTRequest } from 'src/auth/IExpressJWTRequest'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { ScheduleDto } from 'src/dataObjects/dto/schedule.dto'
import { PaginatedDto } from 'src/dataObjects/dto/paginated.dto'
import { PaginationParams } from 'src/dataObjects/dto/pagination-params.dto'
import { ScheduleService } from './schedule.service'
import { v4 } from 'uuid'
import { SlotService } from 'src/slots/slot.service'
import { SlotDto } from 'src/dataObjects/dto/slot.dto'
import { ISlot } from 'interface/Model/ISlot'
import { Schedule } from 'src/dataObjects/schema/schedule.schema'
@ApiTags('api/schedule')
@Controller('api/schedule')
@ApiExtraModels(PaginatedDto)
@UseGuards(JwtAuthGuard)
export class ScheduleController implements IController<ScheduleDto> {
  constructor (
    private _ScheduleService: ScheduleService,
    private _slotService: SlotService,
  ) {}

  @Post()
  async create (
    @Req() req: ExpressJWTRequest,
    @Body() body: ScheduleDto,
  ): Promise<any> {
    {
      //generate uuid
      function genUUID () {
        return v4()
      }

      body.created_user = req.user.tokenDetails.uuid
      body.created_date = new Date()
      const { inputs, startDate, endDate } = body
      // const schedule = []
      // body.schedule = schedule

      let currentDate = new Date(startDate)

      const data = (this._ScheduleService.create(
        body,
      ) as unknown) as Promise<ScheduleDto>

      // console.log((await data).uuid, 'data')

      while (currentDate <= new Date(endDate)) {

        for (let i = 0; i < inputs.length; i++) {
          const { start, end, duration } = inputs[i]
          const dayStartUTC = new Date(
            Date.UTC(
              currentDate.getUTCFullYear(),
              currentDate.getUTCMonth(),
              currentDate.getUTCDate(),
              new Date(start).getUTCHours(),
              new Date(start).getUTCMinutes(),
            ),
          )

          const dayEndUTC = new Date(
            Date.UTC(
              currentDate.getUTCFullYear(),
              currentDate.getUTCMonth(),
              currentDate.getUTCDate(),
              new Date(end).getUTCHours(),
              new Date(end).getUTCMinutes(),
            ),
          )
          const slotsPerDay = Math.floor(
            (<any>dayEndUTC - <any>dayStartUTC) / (duration * 60 * 1000),
          )

          for (let i = 0; i < slotsPerDay; i++) {
            body.created_date = new Date()
            var UUID = genUUID()
            const slotStartUTC = new Date(
              dayStartUTC.getTime() + duration * 60 * 1000 * i,
            ).toISOString()

            const slotEndUTC = new Date(
              dayStartUTC.getTime() + duration * 60 * 1000 * (i + 1),
            ).toISOString()

            const existingSlot = await this._slotService.findOne({
              start: { $lt: slotEndUTC },
              end: { $gt: slotStartUTC },
              isDeleted: false,
            })

            if (existingSlot) {
              continue
            } else {
              existingSlot
            }
            const slots = {
              created_user: req.user.tokenDetails.uuid,
              created_date: new Date(),
              isAvailable: true,
              isBooked: false,
              uuid: UUID,
              start: slotStartUTC,
              end: slotEndUTC,
              duration: duration,
              scheduleId: (await data).uuid,
            }
            ;(this._slotService.create(slots) as unknown) as Promise<SlotDto>
          }
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
      return data
    }
  }

  @Get()
  async findAll (
    @Req() req: ExpressJWTRequest,
    @Query() { skip, limit }: PaginationParams,
  ): Promise<any> {
    const query: FilterQuery<ISchedule> = {
      $and: [{ isDeleted: false }],
    }
    return this._ScheduleService.findAll(query, { skip, limit })
  }

  //running
  @Get(':uuid')
  findOne (
    @Req() req: ExpressJWTRequest,
    @Param('uuid') uuid: string,
  ): Promise<Schedule> {
    const query: FilterQuery<ISchedule> = {
      $and: [{ uuid: uuid, isAvailable: true }],
    }
    return this._ScheduleService.findOne(query)
  }

  @Get('doctorId/:doctorId')
  findAllByDoctorId(
    @Req() req: ExpressJWTRequest,
    @Param('doctorId') doctorId: string,
    @Query() { skip, limit }: PaginationParams,
  ): Promise<any> {
    const query: FilterQuery<ISchedule> = {
      $and: [{ created_user: doctorId,isDeleted: false }],
    };
    return this._ScheduleService.findAll(query,{ skip, limit })
  }
  

  @Put(':uuid')
  async update (
    @Req() req: ExpressJWTRequest,
    @Param('uuid') uuid: string,
    @Body() updateDto: Partial<ScheduleDto>,
  ): Promise<any> {

    const query: FilterQuery<ISlot> = {
      $and: [{ scheduleId: uuid, isDeleted: false }],
    }
    const slotsData = await this._slotService.find(query);
    // slotsData.results.forEach(async e => {
      for(let i= 0; i < slotsData.results.length; i++) {
      if(slotsData.results[i].isBooked === true){
         throw new NotFoundException('You have a Booking in this Schedule');
      }else if(slotsData.results[i].isBooked === false){
        const query = { uuid: slotsData.results[i].uuid, isDeleted: false }
        const updateQuery = { uuid: slotsData.results[i].uuid, isDeleted: true ,modified_user: req.user.tokenDetails.uuid, modified_date: new Date()}
        const abc  = await this._slotService.update(query, updateQuery);
        }
      }
    // )
    updateDto.modified_user = req.user.tokenDetails.uuid
    updateDto.modified_date = new Date()
    function genUUID () {
      return v4()
    }
    const { inputs, startDate, endDate } = updateDto
    
    let currentDate = new Date(startDate)
    const scheduleQuery: FilterQuery<ISchedule> = {
      $and: [{ uuid: uuid, isDeleted: false }],
    };
    const data = (this._ScheduleService.update( scheduleQuery,
      updateDto,
    ) as unknown) as Promise<ScheduleDto>

    while (currentDate <= new Date(endDate)) {

      for (let i = 0; i < inputs.length; i++) {
        const { start, end, duration } = inputs[i]
        const dayStartUTC = new Date(
          Date.UTC(
            currentDate.getUTCFullYear(),
            currentDate.getUTCMonth(),
            currentDate.getUTCDate(),
            new Date(start).getUTCHours(),
            new Date(start).getUTCMinutes(),
          ),
        )

        const dayEndUTC = new Date(
          Date.UTC(
            currentDate.getUTCFullYear(),
            currentDate.getUTCMonth(),
            currentDate.getUTCDate(),
            new Date(end).getUTCHours(),
            new Date(end).getUTCMinutes(),
          ),
        )
        const slotsPerDay = Math.floor(
          (<any>dayEndUTC - <any>dayStartUTC) / (duration * 60 * 1000),
        )

        for (let i = 0; i < slotsPerDay; i++) {
          updateDto.created_date = new Date()
          var UUID = genUUID()
          const slotStartUTC = new Date(
            dayStartUTC.getTime() + duration * 60 * 1000 * i,
          ).toISOString()

          const slotEndUTC = new Date(
            dayStartUTC.getTime() + duration * 60 * 1000 * (i + 1),
          ).toISOString()

          const existingSlot = await this._slotService.findOne({
            start: { $lt: slotEndUTC },
            end: { $gt: slotStartUTC },
            isDeleted: false
          })

          if (existingSlot) {
            continue
          } else {
            existingSlot
          }
          const slots = {
            created_user: req.user.tokenDetails.uuid,
            created_date: new Date(),
            isAvailable: true,
            isBooked: false,
            uuid: UUID,
            start: slotStartUTC,
            end: slotEndUTC,
            duration: duration,
            scheduleId: (await data).uuid,
          }
          ;(this._slotService.create(slots) as unknown) as Promise<SlotDto>
        }
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return data
  }







  @Delete(':uuid')
  delete (
    @Req() req: ExpressJWTRequest,
    @Param('uuid') uuid: string,
  ): Promise<Schedule> {
    const query: FilterQuery<ISchedule> = {
      $and: [{ uuid: uuid, isBooked: false }],
    }
    return this._ScheduleService.delete(query, req.user.tokenDetails.uuid)
  }

 

}
