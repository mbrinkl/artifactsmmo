import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CharInfo } from "../models/dbCharInfo";
import { Repository } from "typeorm";
import { Activity, CharacterInfo } from "@artifacts/shared";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(CharInfo)
    private readonly userRepository: Repository<CharInfo>,
  ) {}

  async create(info: CharacterInfo): Promise<CharInfo> {
    const data: Partial<CharInfo> = {
      name: info.characterName,
      activityName: info.activity ? info.activity.name : null,
      activityParams: info.activity ? JSON.stringify(info.activity.params) : null,
    };
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
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
              params: JSON.parse(x.activityParams),
            } as Activity),
    }));
  }
}
