import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CharacterActivity } from "../models/characterActivity.model";
import { Repository } from "typeorm";
import { CharacterInfo } from "@artifacts/shared";

@Injectable()
export class CharacterActivityRepository {
  constructor(
    @InjectRepository(CharacterActivity)
    private readonly userRepository: Repository<CharacterActivity>,
  ) {}

  async upsert(info: CharacterInfo): Promise<void> {
    const data: Partial<CharacterActivity> = {
      name: info.characterName,
      currentActivity: info.activity ? JSON.stringify(info.activity) : null,
      defaultActivity: info.defaultActivity ? JSON.stringify(info.defaultActivity) : null,
      error: info.error || null,
    };
    await this.userRepository.upsert(data, ["name"]);
  }

  async findAll(): Promise<CharacterInfo[]> {
    const data = await this.userRepository.find();
    return data.map((x) => ({
      characterName: x.name,
      activity: x.currentActivity === null ? null : JSON.parse(x.currentActivity),
      defaultActivity: x.defaultActivity === null ? null : JSON.parse(x.defaultActivity),
      error: x.error,
    }));
  }
}
