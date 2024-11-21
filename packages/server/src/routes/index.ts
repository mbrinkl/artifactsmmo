import { FastifyInstance } from "fastify";
import { serverState, db } from "..";
import { CharacterInfo } from "@artifacts/shared";
import { characterActivityTable } from "../db/schema";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import path from "path";

export const initFastify = async (fastify: FastifyInstance) => {
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
  await fastify.register(routes);
};

const routes = (fastify: FastifyInstance) => {
  fastify.addHook("onRequest", (req, res, done) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(400).send(new Error("No Auth Token"));
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(400).send(new Error("Invalid Auth Token Format"));
    }

    const token = authHeader.substring(7, authHeader.length);
    if (token !== process.env.auth_token) {
      return res.status(400).send(new Error("Invalid Auth Token"));
    }

    done();
  });

  fastify.get("/init", (req, res) => {
    res.send(serverState.encyclopedia);
  });

  fastify.get("/dashboard-data", (req, res) => {
    res.send(serverState.getInfo());
  });

  fastify.post("/update-activity", async (req, res) => {
    const info = JSON.parse(req.body as string) as CharacterInfo;

    const existingContext = serverState.ctxMap[info.characterName];
    if (!existingContext) {
      return res.status(400).send("Invalid character name: " + info.characterName);
    }

    serverState.update(info);

    const storeData: typeof characterActivityTable.$inferInsert = {
      name: info.characterName,
      activityName: info.activity?.name || null,
      activityParams: info.activity?.params ? JSON.stringify(info.activity.params) : null,
    };

    await db.insert(characterActivityTable).values(storeData).onConflictDoUpdate({
      target: characterActivityTable.name,
      set: storeData,
    });

    res.send(serverState.getInfo());
  });
};
