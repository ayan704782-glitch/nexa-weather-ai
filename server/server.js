import "dotenv/config";
import express from "express";
import cors from "cors";
import weatherRouter from "./routes/Weather.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.disable("x-powered-by");

// Allow requests from the React frontend.
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  })
);

// Parse JSON request bodies with a size limit.
app.use(express.json({ limit: "10kb" }));

// Backend welcome route.
app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Welcome to NexaWeather AI backend",
  });
});

// Backend health-check route.
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    app: "NexaWeather AI",
    message: "Backend is running successfully",
    time: new Date().toISOString(),
  });
});

// Weather API routes.
app.use("/api/weather", weatherRouter);

// Handle unknown routes.
app.use((req, res) => {
  res.status(404).json({
    error: "API route not found",
    requestedPath: req.originalUrl,
    method: req.method,
  });
});

// Handle Express application errors.
app.use((err, _req, res, _next) => {
  console.error("Application error:", err.message);

  res.status(500).json({
    error: "Internal server error",
  });
});

// Start the server and report startup errors.
const server = app.listen(PORT, () => {
  console.log(`NexaWeather API running at http://localhost:${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Stop the other server or use another port.`
    );
  } else {
    console.error("Server startup error:", error.message);
  }

  process.exitCode = 1;
});