import express from "express";
import { dailySummaryRouter } from "./routes/dailySummary";
import { errorHandler } from "./errors";

const app = express();
const port = process.env.PORT ?? 4000;
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", frontendOrigin);
  next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", dailySummaryRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
