import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CharInfo } from "./models/dbCharInfo";
import { AuthGuard } from "./common/guards/auth.guard";
import { UserService } from "./services/dbCharInfoRepository";
import { APP_GUARD } from "@nestjs/core";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "../../.env",
    }),
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: process.env.DB_PATH || "db.sqlite",
      entities: [CharInfo], // Register all your entities here
      synchronize: true, // Automatically creates database and tables
    }),
    TypeOrmModule.forFeature([CharInfo]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UserService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
