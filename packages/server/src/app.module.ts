import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CharacterActivity } from "./models/characterActivity.model";
import { AuthGuard } from "./common/guards/auth.guard";
import { CharacterActivityService } from "./services/characterActivity.service";
import { APP_GUARD } from "@nestjs/core";
import { ArtifactsApiService } from "./services/artifactsApi.service";

const getDbFilePath = (envPath: string | undefined) => {
  let dbPath = envPath || "";
  if (dbPath && !dbPath.endsWith("/")) {
    dbPath += "/";
  }
  return dbPath + "db.sqlite";
};

@Module({
  imports: [
    ...(process.env.NODE_ENV !== "production"
      ? [
          ConfigModule.forRoot({
            envFilePath: "../../.env",
          }),
        ]
      : []),
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: getDbFilePath(process.env.db_path),
      entities: [CharacterActivity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([CharacterActivity]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ArtifactsApiService,
    CharacterActivityService,
    {
      provide: "INITIAL_DATA",
      useFactory: async (client: ArtifactsApiService) => {
        return await client.getInitialData();
      },
      inject: [ArtifactsApiService],
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
