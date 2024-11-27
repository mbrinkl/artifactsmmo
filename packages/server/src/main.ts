import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DEFAULT_PORT } from "@artifacts/shared";

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  if (process.env.NODE_ENV !== "production") {
    app.enableCors();
  }
  await app.listen(process.env.PORT || DEFAULT_PORT);
};

bootstrap();
