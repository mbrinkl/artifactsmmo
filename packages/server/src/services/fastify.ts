import Fastify, { FastifyInstance } from "fastify";
import { CharacterInfo, DEFAULT_PORT } from "@artifacts/shared";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import path from "path";
import { Logger } from "pino";
import { ServerState } from "./serverState";
import { DbAccessor } from "./dbAccessor";

export const initFastify = async (serverState: ServerState, dbAccessor: DbAccessor, logger: Logger) => {
  const fastify = Fastify({
    loggerInstance: logger.child({ name: "Fastify" }),
  });

  if (process.env.NODE_ENV === "development") {
    await fastify.register(fastifyCors);
  } else {
    await fastify.register(fastifyStatic, {
      root: path.join(__dirname, "./static"),
    });
    fastify.get("/", (req, res) => {
      res.sendFile("index.html");
    });
  }

  await fastify.register(routes, { serverState, dbAccessor });

  fastify.listen({ port: Number(process.env.port) || DEFAULT_PORT, host: "0.0.0.0" }, (err) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  });
};

interface RouteOptions {
  serverState: ServerState;
  dbAccessor: DbAccessor;
}

const routes = (fastify: FastifyInstance, { serverState, dbAccessor }: RouteOptions) => {
  fastify.addHook("onRequest", (req, res, done) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).send(new Error("No Auth Token"));
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).send(new Error("Invalid Auth Token Format"));
    }

    const token = authHeader.substring(7, authHeader.length);
    if (token !== process.env.auth_token) {
      return res.status(401).send(new Error("Invalid Auth Token"));
    }

    done();
  });

  fastify.get("/api/init", (req, res) => {
    res.send(serverState.encyclopedia);
  });

  fastify.get("/api/dashboard-data", (req, res) => {
    res.send(serverState.getInfo());
  });

  fastify.post("/api/update-activity", async (req, res) => {
    const info = JSON.parse(req.body as string) as CharacterInfo;

    const existingContext = serverState.ctxMap[info.characterName];
    if (!existingContext) {
      return res.status(400).send("Invalid character name: " + info.characterName);
    }

    serverState.update(info);
    dbAccessor.upsertCharacter(info);

    res.send(serverState.getInfo());
  });
};
