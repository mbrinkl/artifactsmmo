import { Injectable, Logger } from "@nestjs/common";
import {
  ActionResultData,
  Destination,
  Drop,
  Encyclopedia,
  Item,
  Monster,
  paths,
  Resource,
  Square,
} from "@artifacts/shared";
import createClient from "openapi-fetch";

export interface InitialData {
  characterNames: string[];
  encyclopedia: Encyclopedia;
}

export type QueueAction =
  | { type: "move"; payload: Destination }
  | { type: "craft"; payload: Drop }
  | { type: "fight"; payload?: never }
  | { type: "gather"; payload?: never }
  | { type: "deposit"; payload: Drop }
  | { type: "withdraw"; payload: Drop }
  | { type: "rest"; payload?: never };

@Injectable()
export class ArtifactsApiService {
  private client: ReturnType<typeof createClient<paths>>;
  private logger = new Logger(ArtifactsApiService.name);

  constructor() {
    this.client = createClient<paths>({
      baseUrl: "https://api.artifactsmmo.com",
      headers: {
        Authorization: "Bearer " + process.env.auth_token,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  }

  async doIt(name: string, { type, payload }: QueueAction) {
    switch (type) {
      case "move":
        return await this.move(name, payload);
      case "gather":
        return await this.gather(name);
      case "craft":
        return await this.craft(name, payload);
      case "fight":
        return await this.fight(name);
      case "rest":
        return await this.rest(name);
      case "deposit":
        return await this.deposit(name, payload);
      case "withdraw":
        return await this.withdraw(name, payload);
    }
    throw new Error("Invalid action type: " + name);
  }

  async getInitialData(): Promise<InitialData> {
    this.logger.log("fetching assets");
    const start = Date.now();
    const [characters, squares, items, resources, monsters] = await Promise.all([
      this.getCharacters(),
      this.getMaps(),
      this.getItems(),
      this.getResources(),
      this.getMonsters(),
    ]);
    this.logger.log(`fetched assets in ${Date.now() - start}ms`);
    const characterNames = characters.map((x) => x.name);
    return { characterNames, encyclopedia: { items, squares, resources, monsters } };
  }

  async getCharacters() {
    const { data, error } = await this.client.GET("/my/characters");
    const characters = this.handleX(data?.data, error);
    if (characters.length === 0) {
      throw new Error("No characters found");
    }
    return characters;
  }

  async getCharacter(name: string) {
    const { data, error } = await this.client.GET("/characters/{name}", { params: { path: { name } } });
    return this.handleX(data?.data, error);
  }

  private async move(name: string, destination: Destination) {
    const { data, error } = await this.client.POST("/my/{name}/action/move", {
      params: { path: { name } },
      body: destination,
    });

    return handle(data?.data, error, [490]);
  }

  private async fight(name: string) {
    const { data, error } = await this.client.POST("/my/{name}/action/fight", {
      params: { path: { name } },
    });
    return handle(data?.data, error);
  }

  private async craft(name: string, item: Drop) {
    const { data, error } = await this.client.POST("/my/{name}/action/crafting", {
      params: { path: { name } },
      body: item,
    });
    return handle(data?.data, error);
  }

  private async gather(name: string) {
    const { data, error } = await this.client.POST("/my/{name}/action/gathering", {
      params: { path: { name } },
    });
    return handle(data?.data, error);
  }

  private async rest(name: string) {
    const { data, error } = await this.client.POST("/my/{name}/action/rest", {
      params: { path: { name } },
    });
    return handle(data?.data, error);
  }

  private async withdraw(name: string, item: Drop) {
    const { data, error } = await this.client.POST("/my/{name}/action/bank/withdraw", {
      params: { path: { name } },
      body: item,
    });
    return handle(data?.data, error);
  }

  private async deposit(name: string, item: Drop) {
    const { data, error } = await this.client.POST("/my/{name}/action/bank/deposit", {
      params: { path: { name } },
      body: item,
    });
    return handle(data?.data, error);
  }

  private async getMaps(page: number = 1, accumulated: Square[] = []): Promise<Square[]> {
    const { data, error } = await this.client.GET("/maps", { params: { query: { page, size: 100 } } });
    const result = this.handleX(data?.data, error);
    if (page === Number(data!.pages)) {
      return [...accumulated, ...result];
    }
    return await this.getMaps(page + 1, [...accumulated, ...result]);
  }

  private async getItems(page: number = 1, accumulated: Item[] = []): Promise<Item[]> {
    const { data, error } = await this.client.GET("/items", { params: { query: { page, size: 100 } } });
    const result = this.handleX(data?.data, error);
    if (page === Number(data!.pages)) {
      return [...accumulated, ...result];
    }
    return await this.getItems(page + 1, [...accumulated, ...result]);
  }

  private async getResources(page: number = 1, accumulated: Resource[] = []): Promise<Resource[]> {
    const { data, error } = await this.client.GET("/resources", { params: { query: { page, size: 100 } } });
    const result = this.handleX(data?.data, error);
    if (page === Number(data!.pages)) {
      return [...accumulated, ...result];
    }
    return await this.getResources(page + 1, [...accumulated, ...result]);
  }

  private async getMonsters(page: number = 1, accumulated: Monster[] = []): Promise<Monster[]> {
    const { data, error } = await this.client.GET("/monsters", { params: { query: { page, size: 100 } } });
    const result = this.handleX(data?.data, error);
    if (page === Number(data!.pages)) {
      return [...accumulated, ...result];
    }
    return await this.getMonsters(page + 1, [...accumulated, ...result]);
  }

  private handleX<T>(data: T | undefined, error: Err | undefined): T {
    if (error) {
      throw new Error(`${error.error.code} ${error.error.message}`);
    }
    if (!data) {
      throw new Error("Unexpected data and error missing");
    }

    return data;
  }
}

interface Err {
  error: {
    code: number;
    message: string;
  };
}

const handle = <TData extends ActionResultData>(
  data: TData | undefined,
  error: Err | undefined,
  ignoreCodes?: number[],
): TData | null => {
  if (error) {
    if (ignoreCodes && ignoreCodes.includes(error.error.code)) {
      // logger.warn("ignoring error", error.error);
      return null;
    }
    throw new Error(`${error.error.code} ${error.error.message}`);
  }
  if (!data) {
    throw new Error("Unexpected data and error missing");
  }

  return data;
};
