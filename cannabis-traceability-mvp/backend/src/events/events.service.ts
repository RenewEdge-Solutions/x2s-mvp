import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';

export interface CreateEventDto {
  title: string;
  description?: string;
  date: string;
  time?: string;
  isCustom?: boolean;
  type?: string;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  type?: string;
}

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const eventData = {
      title: createEventDto.title,
      description: createEventDto.description,
      date: new Date(createEventDto.date),
      time: createEventDto.time && createEventDto.time.trim() !== '' ? createEventDto.time : undefined,
      isCustom: createEventDto.isCustom ?? true,
      type: createEventDto.type,
    };
    
    const event = this.eventsRepository.create(eventData);
    return this.eventsRepository.save(event);
  }

  async findAll(): Promise<Event[]> {
    return this.eventsRepository.find({
      order: { date: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event) {
      throw new Error(`Event with ID ${id} not found`);
    }
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);
    
    const updateData: any = { ...updateEventDto };
    if (updateEventDto.date) {
      updateData.date = new Date(updateEventDto.date);
    }
    if ('time' in updateEventDto) {
      updateData.time = updateEventDto.time && updateEventDto.time.trim() !== '' ? updateEventDto.time : undefined;
    }

    await this.eventsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const event = await this.findOne(id);
    await this.eventsRepository.remove(event);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    return this.eventsRepository
      .createQueryBuilder('event')
      .where('event.date >= :startDate', { startDate })
      .andWhere('event.date <= :endDate', { endDate })
      .orderBy('event.date', 'ASC')
      .addOrderBy('event.createdAt', 'ASC')
      .getMany();
  }
}
