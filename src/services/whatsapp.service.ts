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

  constructor() {
    this.sessionDir = path.join(process.cwd(), config.SESSION_ID);
  }

  public async init() {
    const { state, saveCreds } = await useMultiFileAuthState(this.sessionDir);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Usando WhatsApp Web v${version.join('.')} (isLatest: ${isLatest})`);

    this.sock = makeWASocket({
      auth: state,
      logger: pino({ level: 'silent' }) as any,
      browser: Browsers.macOS('Desktop'),
      version,
      syncFullHistory: false,
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
        
        console.log(`Conexão fechada. Motivo: ${statusCode}. Reconectando: ${shouldReconnect}`);
        if (statusCode && statusCode !== 401 && statusCode !== 408) {
          console.error('Detalhes do erro:', error);
        }
        this.connectionStatus = 'close';
        this.qr = null;
        this.qrBase64 = null;

        if (shouldReconnect) {
          setTimeout(() => this.init(), 5000);
        } else {
          console.log('Sessão encerrada pelo usuário. Limpando arquivos...');
          this.clearSessionFiles();
        }
      } else if (connection === 'connecting') {
        this.connectionStatus = 'connecting';
        console.log('Conectando ao WhatsApp...');
      } else if (connection === 'open') {
        this.connectionStatus = 'open';
        this.qr = null;
        this.qrBase64 = null;
        console.log('ZapBridge: Conexão estabelecida com sucesso!');
      }
    });
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
      this.sock.end(undefined);
    }
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
