import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import QRCode from "qrcode";
import fs from "fs";
import pino from "pino";

class WhatsAppService {
  private sock: any;
  private isConnected = false;
  private isConnecting = false;
  private currentQR: string | null = null;
  private qrBase64: string | null = null;

  async connect() {
    if (this.isConnecting) {
      console.log("⏳ Já existe uma tentativa de conexão em curso...");
      return;
    }

    this.isConnecting = true;
    
    // Busca a versão mais recente do WhatsApp Web
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`🌐 Usando WhatsApp Web v${version.join(".")}. É a mais recente? ${isLatest}`);

    const { state, saveCreds } = await useMultiFileAuthState("auth");

    // Limpa listeners antigos se existirem
    if (this.sock) {
      this.sock.ev.removeAllListeners("connection.update");
      this.sock.ev.removeAllListeners("creds.update");
    }

    this.sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: "error" }), // Voltando para error para não poluir, já sabemos o erro
      browser: Browsers.macOS("Desktop"),
      syncFullHistory: false,
      markOnlineOnConnect: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 0,
    });

    this.sock.ev.on("creds.update", saveCreds);

    this.sock.ev.on("connection.update", async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.currentQR = qr;
        this.qrBase64 = await QRCode.toDataURL(qr);
        console.log("📱 Novo QR gerado");
      }

      if (connection === "open") {
        this.isConnected = true;
        this.isConnecting = false;
        this.currentQR = null;
        this.qrBase64 = null;
        console.log("✅ WhatsApp conectado!");
      }

      if (connection === "close") {
        this.isConnected = false;
        this.isConnecting = false;

        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        
        // Se for 401 (Logged Out), não reconecta automaticamente
        // Se for 405, a sessão geralmente está corrompida e precisa de limpeza
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;
        const isMethodNotAllowed = statusCode === 405;
        const shouldReconnect = !isLoggedOut && !isMethodNotAllowed;

        console.log(`❌ Conexão fechada. Código: ${statusCode}. Reconectar?`, shouldReconnect);

        if (isMethodNotAllowed) {
          console.log("⚠️ Erro 405 detectado: A sessão pode estar corrompida. Tente limpar a pasta 'auth' ou usar o endpoint de restart.");
        }

        if (shouldReconnect) {
          const delay = (statusCode === 428) ? 10000 : 5000;
          console.log(`⏳ Aguardando ${delay / 1000} segundos para tentar reconectar...`);
          await this.sleep(delay);
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
      isConnecting: this.isConnecting
    };
  }

  async disconnect() {
    this.isConnected = false;
    this.isConnecting = false;

    if (this.sock) {
      try {
        // Remove os listeners antes de fechar para o 'close' não disparar o reconnect
        this.sock.ev.removeAllListeners("connection.update");
        await this.sock.logout();
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
      }
      this.sock = null;
      this.qrBase64 = null;
    }

    if (fs.existsSync("auth")) {
      try {
        fs.rmSync("auth", { recursive: true, force: true });
        console.log("📂 Pasta 'auth' removida com sucesso!");
      } catch (err) {
        console.error("Erro ao remover pasta 'auth':", err);
      }
    }

    // Aguarda um momento antes de iniciar uma nova conexão limpa
    await this.sleep(2000);
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
