import "dotenv/config";
import express from "express";
import cors from "cors";
import logsRouter from "./routes/logs";
import usersRouter from "./routes/users";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
app.use(express.json());

app.use("/api", logsRouter);
app.use("/api", usersRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
