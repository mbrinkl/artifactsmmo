import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CharacterInfo } from "@artifacts/shared";
import { InitialData } from "./services/artifactsApi.service";

describe("AppController", () => {
  let appController: AppController;

  const mockCharacterInfo: CharacterInfo[] = [{ characterName: "test-name", activity: null }];
  const mockAppService = {
    getAllCharacterInfo: vi.fn().mockReturnValue(mockCharacterInfo),
    update: vi.fn(),
  };
  const mockInitialData: InitialData = {
    characterNames: mockCharacterInfo.map((x) => x.characterName),
    encyclopedia: { items: [], monsters: [], resources: [], squares: [] },
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: AppService, useValue: mockAppService },
        { provide: "INITIAL_DATA", useValue: mockInitialData },
      ],
    }).compile();

    appController = app.get(AppController);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should get encyclopedia", () => {
    expect(appController.getEncyclopedia()).toEqual(mockInitialData.encyclopedia);
  });

  it("should get characters", () => {
    expect(appController.getCharacters()).toEqual(mockCharacterInfo);
  });

  it("should throw Bad Request for invalid name on update", () => {
    expect(appController.update({ characterName: "invalid-name", activity: null })).rejects.toThrow();
  });

  it("should throw Bad Request for invalid name on update", async () => {
    const result = await appController.update({ characterName: "test-name", activity: null });
    expect(result).toEqual(mockCharacterInfo);
  });
});
