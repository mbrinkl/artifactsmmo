import { Body, Controller, Get, HttpException, HttpStatus, Post } from "@nestjs/common";
import { AppService } from "./app.service";
import { CharacterInfo, Encyclopedia } from "@artifacts/shared";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("encyclopedia")
  getEncyclopedia(): Encyclopedia {
    return this.appService.encyclopedia;
  }

  @Get("characters")
  getCharacters(): CharacterInfo[] {
    return this.appService.getInfo();
  }

  @Post("update")
  async update(@Body() info: CharacterInfo): Promise<CharacterInfo[]> {
    if (!this.appService.ctxMap[info.characterName]) {
      throw new HttpException(`Invalid Character Name: ${info.characterName}`, HttpStatus.BAD_REQUEST);
    }
    // dbAccessor.upsertCharacter(info);
    await this.appService.update(info);
    return this.appService.getInfo();
  }
}
