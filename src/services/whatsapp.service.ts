import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import QRCode from "qrcode";
import fs from "fs";

class WhatsAppService {
  private sock: any;
  private isConnected = false;
  private currentQR: string | null = null;
  private qrBase64: string | null = null;

  async connect() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");

    this.sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
    });

    this.sock.ev.on("creds.update", saveCreds);

    this.sock.ev.on("connection.update", async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      // 🔥 Gerar QR em Base64
      if (qr) {
        this.currentQR = qr;
        this.qrBase64 = await QRCode.toDataURL(qr);
        console.log("📱 Novo QR gerado");
      }

      if (connection === "open") {
        this.isConnected = true;
        this.currentQR = null;
        this.qrBase64 = null;
        console.log("✅ WhatsApp conectado!");
      }

      if (connection === "close") {
        this.isConnected = false;

        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut;

        console.log("❌ Conexão fechada. Reconectar?", shouldReconnect);

        if (shouldReconnect) {
          console.log("⏳ Aguardando 5 segundos para tentar reconectar...");
          await this.sleep(5000);
          this.connect();
        }
      }
    });
  }

  getQR() {
    return this.qrBase64;
  }

  status() {
    return {
      connected: this.isConnected,
      hasQR: !!this.qrBase64,
    };
  }

  async disconnect() {
    if (this.sock) {
      try {
        await this.sock.logout();
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
      }
      this.sock = null;
      this.isConnected = false;
      this.qrBase64 = null;
    }

    if (fs.existsSync("auth")) {
      fs.rmSync("auth", { recursive: true, force: true });
      console.log("📂 Pasta 'auth' removida com sucesso!");
    }

    // Inicia uma nova conexão limpa para gerar um novo QR Code
    await this.connect();
  }

  async restart() {
    await this.disconnect();
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async sendMessage(
    number: string,
    message: string,
    options?: { delayTyping?: number; delayMessage?: number },
  ) {
    if (!this.isConnected || !this.sock) {
      throw new Error("WhatsApp não conectado");
    }

    const jid = number.includes("@s.whatsapp.net")
      ? number
      : `${number}@s.whatsapp.net`;

    // 1. Lógica de delayTyping (Digitando...)
    if (options?.delayTyping && options.delayTyping > 0) {
      await this.sock.sendPresenceUpdate("composing", jid);
      await this.sleep(options.delayTyping * 1000);
      await this.sock.sendPresenceUpdate("paused", jid);
    }

    // 2. Lógica de delayMessage (Espera antes de enviar)
    let msgDelay = options?.delayMessage;
    if (msgDelay === undefined) {
      // Default 1-3 segundos se não informado
      msgDelay = Math.floor(Math.random() * (3 - 1 + 1) + 1);
    }

    if (msgDelay > 0) {
      await this.sleep(msgDelay * 1000);
    }

    await this.sock.sendMessage(jid, { text: message });
  }
}

export default new WhatsAppService();
