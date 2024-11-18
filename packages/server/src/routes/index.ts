import { FastifyInstance } from "fastify";

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
    res.send("gg idiot");
  });

  fastify.post("/update-activity", (req, res) => {
    // get activity data from req and character name
    res.send("lol gg idiot again");
  });
};
