import "dotenv/config";
import express from "express";
import cors from "cors";
import logsRouter from "./routes/logs";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
app.use(express.json());

app.use("/api", logsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
