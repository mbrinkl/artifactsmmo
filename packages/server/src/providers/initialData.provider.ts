import { Provider } from "@nestjs/common";
import { ArtifactsApiService } from "src/services/artifactsApi.service";

export const InitialDataProvider: Provider = {
  provide: "INITIAL_DATA",
  useFactory: async (client: ArtifactsApiService) => {
    return await client.getInitialData();
  },
  inject: [ArtifactsApiService],
};
