import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(UserEntity) private repo: Repository<UserEntity>) {}

  findByUsername(username: string) {
    return this.repo.findOne({ where: { username } });
  }

  async upsert(user: Partial<UserEntity>) {
    const existing = user.username ? await this.repo.findOne({ where: { username: user.username } }) : null;
    return existing ? this.repo.save({ ...existing, ...user }) : this.repo.save(this.repo.create(user));
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }
}
