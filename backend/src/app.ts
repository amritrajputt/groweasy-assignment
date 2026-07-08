import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { errorHandler } from "./common/middleware/error.middleware"; 

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(urlencoded({ extended: true }));
app.use(express.json());

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
