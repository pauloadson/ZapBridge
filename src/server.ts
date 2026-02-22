import app from "./app";
import dotenv from "dotenv";
import whatsappService from "./services/whatsapp.service";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";
const PORT =
  NODE_ENV === "production" ? process.env.PORT_PROD : process.env.PORT_DEV;
const URL =
  NODE_ENV === "production"
    ? process.env.PROD_SERVER_URL
    : process.env.DEV_SERVER_URL;

async function bootstrap() {
  await whatsappService.connect();

  app.listen(PORT, () => {
    console.log(`🚀 API rodando na porta ${PORT} (${NODE_ENV})`);
    console.log(`📄 Swagger UI: ${URL}/docs`);
    console.log(`📦 Swagger JSON: ${URL}/docs.json \n`);
  });
}

bootstrap();
