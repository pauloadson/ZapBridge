import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import YAML from "yaml";

import healthRoutes from "./modules/health/health.routes";
import sessionRoutes from "./modules/session/session.routes";
import messageRoutes from "./modules/message/message.routes";
import { authMiddleware } from "./middlewares/auth.middleware";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

/**
 * =============================
 * Swagger Setup
 * =============================
 */
const file = fs.readFileSync(
  path.join(__dirname, "docs", "openapi.yaml"),
  "utf8",
);

const swaggerDocument = YAML.parse(file);

const NODE_ENV = process.env.NODE_ENV || "development";
const DEV_SERVER_URL = process.env.DEV_SERVER_URL || "http://localhost:3000"; // Fallback para desenvolvimento
const PROD_SERVER_URL =
  process.env.PROD_SERVER_URL || "https://api.example.com"; // Fallback para produção

if (NODE_ENV === "production") {
  swaggerDocument.servers = [
    { url: PROD_SERVER_URL, description: "Servidor de Produção" },
  ];
} else {
  swaggerDocument.servers = [
    { url: DEV_SERVER_URL, description: "Servidor de Desenvolvimento Local" },
  ];
}

// UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// JSON bruto (para importar no Postman)
app.get("/docs.json", (req, res) => {
  res.json(swaggerDocument);
});

/**
 * =============================
 * API Routes (v1)
 * =============================
 */
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/session", authMiddleware, sessionRoutes);
app.use("/api/v1/messages", authMiddleware, messageRoutes);

export default app;
