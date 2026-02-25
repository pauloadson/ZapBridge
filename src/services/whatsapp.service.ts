import makeWASocket, { 
  ConnectionState, 
  DisconnectReason, 
  useMultiFileAuthState, 
  WASocket,
  delay,
  jidNormalizedUser,
  Browsers,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import path from 'path';
import fs from 'fs';
import { config } from '../config/env';
import pino from 'pino';
import QRCode from 'qrcode';
import qrcodeTerminal from 'qrcode-terminal';

class WhatsAppService {
  private sock: WASocket | null = null;
  private qr: string | null = null;
  private qrBase64: string | null = null;
  private connectionStatus: 'open' | 'connecting' | 'close' = 'close';
  private sessionDir: string;
  private isInitializing = false;

  constructor() {
    this.sessionDir = path.join(process.cwd(), config.SESSION_ID);
    console.log(`[WhatsAppService] Iniciando com SESSION_ID: ${config.SESSION_ID} em modo ${config.NODE_ENV}`);
  }

  public async init() {
    if (this.isInitializing) {
      console.log('[WhatsAppService] Inicialização já em andamento, ignorando...');
      return;
    }

    this.isInitializing = true;

    try {
      const { state, saveCreds } = await useMultiFileAuthState(this.sessionDir);
      const { version, isLatest } = await fetchLatestBaileysVersion();
      console.log(`[WhatsAppService] Usando WhatsApp Web v${version.join('.')} (isLatest: ${isLatest})`);

      // Limpa socket anterior se existir
      if (this.sock) {
        this.sock.ev.removeAllListeners('connection.update');
        this.sock.ev.removeAllListeners('creds.update');
      }

      this.sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }) as any,
        browser: Browsers.ubuntu('Chrome'),
        version,
        syncFullHistory: false,
        connectTimeoutMs: 60000,
        printQRInTerminal: false,
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.qr = qr;
          this.qrBase64 = await QRCode.toDataURL(qr);
          console.log('\n--- ESCANEIE O QR CODE ABAIXO ---');
          qrcodeTerminal.generate(qr, { small: true });
        }

        if (connection === 'close') {
          const error = lastDisconnect?.error as Boom;
          const statusCode = error?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          
          console.log(`[WhatsAppService] Conexão fechada. Motivo: ${statusCode}. Reconectando: ${shouldReconnect}`);
          
          this.connectionStatus = 'close';
          this.qr = null;
          this.qrBase64 = null;

          if (shouldReconnect) {
            this.isInitializing = false; // Permite nova tentativa
            setTimeout(() => this.init(), 5000);
          } else {
            console.log('[WhatsAppService] Sessão encerrada. Limpando arquivos...');
            this.clearSessionFiles();
          }
        } else if (connection === 'connecting') {
          this.connectionStatus = 'connecting';
          console.log('[WhatsAppService] Conectando ao WhatsApp...');
        } else if (connection === 'open') {
          this.connectionStatus = 'open';
          this.qr = null;
          this.qrBase64 = null;
          console.log('ZapBridge: Conexão estabelecida com sucesso!');
        }
      });
    } catch (err) {
      console.error('[WhatsAppService] Erro na inicialização:', err);
    } finally {
      this.isInitializing = false;
    }
  }

  public async sendMessage(
    phone: string, 
    message: string, 
    options?: { delayTyping?: number, delayMessage?: number, editMessageId?: string }
  ) {
    if (this.connectionStatus !== 'open' || !this.sock) {
      throw new Error('WhatsApp is not connected.');
    }

    // Clean phone number: remove non-digits only if it's not a group JID
    let jid = '';
    if (phone.includes('@g.us')) {
      jid = phone;
    } else {
      const digits = phone.replace(/\D/g, '');
      jid = `${digits}@s.whatsapp.net`;
    }

    const { delayTyping, delayMessage, editMessageId } = options || {};

    // 1. delayTyping
    if (delayTyping && delayTyping > 0) {
      // Range 1~15 sec
      const typingTime = Math.min(Math.max(delayTyping, 1), 15);
      await this.sock.sendPresenceUpdate('composing', jid);
      await delay(typingTime * 1000);
      await this.sock.sendPresenceUpdate('paused', jid);
    }

    // 2. delayMessage
    let finalDelay = delayMessage ?? (Math.floor(Math.random() * 3) + 1); // 1-3s default
    finalDelay = Math.min(Math.max(finalDelay, 1), 15); // Range 1~15 sec
    await delay(finalDelay * 1000);

    // 3. Edit or Send
    if (editMessageId) {
      const sentMsg = await this.sock.sendMessage(jid, {
        text: message,
        edit: {
          id: editMessageId,
          remoteJid: jid,
          fromMe: true
        }
      } as any);
      return sentMsg;
    } else {
      const sentMsg = await this.sock.sendMessage(jid, { text: message });
      return sentMsg;
    }
  }

  public getStatus() {
    return {
      status: this.connectionStatus,
      qr: this.qrBase64,
    };
  }

  public async disconnect() {
    if (this.sock) {
      try {
        await this.sock.logout();
      } catch (err) {
        console.error('Logout error:', err);
      }
      this.sock = null;
    }
    this.clearSessionFiles();
  }

  public async restart() {
    if (this.sock) {
      // Remove listeners para que o evento 'close' não dispare o reconnect via setTimeout
      this.sock.ev.removeAllListeners('connection.update');
      this.sock.end(undefined);
    }
    this.connectionStatus = 'close';
    this.qr = null;
    this.qrBase64 = null;
    await this.init();
  }

  private clearSessionFiles() {
    if (fs.existsSync(this.sessionDir)) {
      try {
        fs.rmSync(this.sessionDir, { recursive: true, force: true });
      } catch (err) {
        console.error('Error clearing session folder:', err);
      }
    }
    this.connectionStatus = 'close';
    this.qr = null;
    this.qrBase64 = null;
  }
}

export const whatsappService = new WhatsAppService();
whatsappService.init().catch(console.error);
