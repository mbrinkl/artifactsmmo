import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DEFAULT_PORT } from "@artifacts/shared";

if (!process.env.auth_token) {
  throw new Error("Auth token not set in environment variables");
}

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  if (process.env.NODE_ENV !== "production") {
    app.enableCors();
  }
  await app.listen(process.env.PORT || DEFAULT_PORT);
};

bootstrap();
