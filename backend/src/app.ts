import dotenv from "dotenv";
dotenv.config();

import express, { urlencoded } from "express";
import cors from "cors";
import { serve } from "inngest/express";
import { errorHandler } from "./common/middleware/error.middleware.js"; 
import importRouter from "./modules/import/import.routes.js";
import { inngest } from "./inngest/inngest-client.js";
import { functions } from "./inngest/inngest-function.js";

const app = express();


app.use(cors({ origin: "http://localhost:3000" }));
app.use(urlencoded({ limit: "5mb", extended: true }));
app.use(express.json({ limit: "5mb" }));

app.use("/api/import", importRouter);
app.use("/api/inngest", serve({ client: inngest, functions }));


app.get("/health", (req, res) => {
  res.send("ok");
});

app.use(errorHandler);

function startServer() {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server started on port http://localhost:${port}`);
  });
}

startServer();
