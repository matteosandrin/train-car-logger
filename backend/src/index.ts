import "./config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import logsRouter from "./routes/logs";
import notificationRouter from "./routes/notification"

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
app.use(express.json());

app.use("/api", authRouter);
app.use("/api", logsRouter);
app.use("/api", notificationRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
