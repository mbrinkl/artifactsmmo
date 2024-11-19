import { FastifyInstance } from "fastify";
import { scenarioFactory } from "../scenarios";
import { characterContext, db } from "..";
import { CharacterInfo } from "@artifacts/shared";
import { CharacterContext } from "../types";
import { characterActivityTable } from "../db/schema";

export const hooks = (fastify: FastifyInstance) => {
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
};

export const routes = (fastify: FastifyInstance) => {
  fastify.get("/dashboard-data", (req, res) => {
    // TODO: maybe strip queue
    res.send(Object.values(characterContext));
  });

  fastify.post("/update-activity", async (req, res) => {
    const body = JSON.parse(req.body as string) as CharacterInfo;
    const existingContext = characterContext[body.characterName];
    if (!existingContext) {
      return res.status(400).send("Invalid character name: " + body.characterName);
    }
    const ctx: CharacterContext = {
      ...existingContext,
      queue: [],
      version: existingContext.version + 1,
      activity: body.activity,
    };
    characterContext[ctx.characterName] = ctx;
    scenarioFactory(ctx);

    const storeData: typeof characterActivityTable.$inferInsert = {
      name: ctx.characterName,
      activityName: ctx.activity?.name || null,
      activityContext: ctx.activity?.context ? JSON.stringify(ctx.activity.context) : null,
    };
    await db.insert(characterActivityTable).values(storeData);

    res.send(body);
  });

  // stop-after-task ?
  // stop-after-queue
};
