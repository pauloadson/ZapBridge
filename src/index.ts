import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { config } from "./config/env";
import routes from "./routes";
import { whatsappService } from "./services/whatsapp.service";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Swagger
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ZapBridge API",
      version: "1.0.0",
      description: "API para envio de mensagens via WhatsApp com Baileys",
    },
    servers: [
      {
        url: `${config.BASE_URL}/api`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, "./routes/*.{ts,js}")],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Routes
app.use("/api", routes);

app.listen(config.PORT, () => {
  console.log(`ZapBridge running on ${config.BASE_URL}`);
  console.log(`Documentation: ${config.BASE_URL}/docs`);
});
