import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CharacterActivity } from "../models/characterActivity.model";
import { Repository } from "typeorm";
import { Activity, CharacterInfo } from "@artifacts/shared";

@Injectable()
export class CharacterActivityService {
  constructor(
    @InjectRepository(CharacterActivity)
    private readonly userRepository: Repository<CharacterActivity>,
  ) {}

  async upsert(info: CharacterInfo): Promise<void> {
    const data: Partial<CharacterActivity> = {
      name: info.characterName,
      activityName: info.activity ? info.activity.name : null,
      activityParams: info.activity ? JSON.stringify(info.activity.params) : null,
      defaultActivityName: info.defaultActivity ? info.defaultActivity.name : null,
      defaultActivityParams: info.defaultActivity ? JSON.stringify(info.defaultActivity.params) : null,
      error: info.error || null,
    };
    await this.userRepository.upsert(data, ["name"]);
  }

  async findAll(): Promise<CharacterInfo[]> {
    const data = await this.userRepository.find();
    return data.map((x) => ({
      characterName: x.name,
      activity:
        x.activityName === null
          ? null
          : ({
              name: x.activityName,
              params: JSON.parse(x.activityParams!),
            } as Activity),
      defaultActivity:
        x.defaultActivityName === null
          ? null
          : ({
              name: x.defaultActivityName,
              params: JSON.parse(x.defaultActivityParams!),
            } as Activity),
      error: x.error,
    }));
  }
}
