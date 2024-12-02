import { Body, Controller, Get, HttpException, HttpStatus, Inject, Post } from "@nestjs/common";
import { AppService } from "./app.service";
import { Activity, CharacterInfo, CharacterInfoResponse, Encyclopedia } from "@artifacts/shared";
import { InitialData } from "./services/artifactsApi.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject("INITIAL_DATA") private readonly data: InitialData,
  ) {}

  @Get("encyclopedia")
  getEncyclopedia(): Encyclopedia {
    return this.data.encyclopedia;
  }

  @Get("characters")
  async getCharacters(): Promise<CharacterInfoResponse> {
    return await this.appService.getAllCharacterInfo();
  }

  @Post("update")
  async update(@Body() info: CharacterInfo): Promise<CharacterInfo[]> {
    if (!this.data.characterNames.includes(info.characterName)) {
      throw new HttpException(`Invalid Character Name: ${info.characterName}`, HttpStatus.BAD_REQUEST);
    }
    await this.appService.update(info);
    return this.appService.getAllCharacterInfo();
  }

  @Post("clear-all")
  async clearAll(): Promise<CharacterInfoResponse> {
    this.appService.clearAll();
    return await this.appService.getAllCharacterInfo();
  }

  @Post("update-default-activity")
  async updateDefaultActivity(@Body() body: { characterName: string; activity: Activity }): Promise<void> {
    await this.appService.updateDefaultActivity(body.characterName, body.activity);
  }

  @Post("set-all-default")
  async setAllDefault(): Promise<CharacterInfoResponse> {
    this.appService.setAllDefault();
    return await this.appService.getAllCharacterInfo();
  }
}
