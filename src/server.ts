import app from "./app";
import dotenv from "dotenv";
import whatsappService from "./services/whatsapp.service";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";
// O Nixpacks/Hostinger geralmente injeta a variável 'PORT' diretamente.
const PORT = process.env.PORT || (NODE_ENV === "production" ? process.env.PORT_PROD : process.env.PORT_DEV) || 3000;
const URL =
  NODE_ENV === "production"
    ? process.env.PROD_SERVER_URL
    : process.env.DEV_SERVER_URL;

async function bootstrap() {
  await whatsappService.connect();

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 API rodando na porta ${PORT} (${NODE_ENV})`);
    if (URL) {
      console.log(`📄 Swagger UI: ${URL}/docs`);
      console.log(`📦 Swagger JSON: ${URL}/docs.json \n`);
    }
  });
}

bootstrap();
