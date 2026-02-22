# ZapBridge 🚀

ZapBridge é uma API robusta para envio de mensagens via WhatsApp, construída com **Node.js** e **TypeScript**, utilizando a biblioteca **Baileys** para uma conexão eficiente com o WhatsApp Web.

O projeto foi desenvolvido para facilitar integrações, automações e notificações de forma simples, escalável e segura.

## 🛠️ Tecnologias Utilizadas

- **Node.js** & **TypeScript**
- **Express**: Framework web rápido e minimalista.
- **Baileys**: Implementação leve do protocolo WhatsApp.
- **Swagger/OpenAPI**: Documentação interativa da API.
- **Helmet & CORS**: Segurança e controle de acesso.

## ✨ Funcionalidades

### 1. Gerenciamento de Sessão
- **QR Code**: Geração de QR Code em Base64 para autenticação.
- **Status da Conexão**: Verificação em tempo real se a instância está conectada.
- **Desconexão/Logout**: Encerramento seguro da sessão.
- **Reinicialização**: Comando para reiniciar o serviço de conexão.

### 2. Envio de Mensagens Inteligente
- **Envio Simples**: Envio de mensagens de texto para qualquer número.
- **Delay de Mensagem (`delayMessage`)**: Intervalo configurável (1-15s) entre o processamento e o envio real da mensagem (Padrão: 1-3s aleatório).
- **Simulação de Digitação (`delayTyping`)**: Exibe o status "Digitando..." no WhatsApp do destinatário por um tempo determinado (1-15s).

### 3. Monitoramento
- **Health Check**: Endpoint para verificar a integridade e o uptime do serviço.

## 🚀 Como Executar

### Pré-requisitos
- Node.js (v18 ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/pauloadson/ZapBridge.git
cd ZapBridge
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (opcional):
Crie um arquivo `.env` baseado no `.env.example`.

### Execução

**Desenvolvimento:**
```bash
npm run dev
```

**Produção:**
```bash
npm run build
npm start
```

## 📄 Documentação (Swagger)

A documentação interativa da API está disponível em:
- **UI**: `http://localhost:3000/docs`
- **JSON**: `http://localhost:3000/docs.json`

## 🛣️ Principais Endpoints

| Método | Rota | Descrição |
|--------|------|-------------|
| GET | `/api/v1/health` | Status da API |
| GET | `/api/v1/session/status` | Status da conexão WhatsApp |
| GET | `/api/v1/session/qr` | Obtém o QR Code atual |
| POST | `/api/v1/session/disconnect` | Desconecta a sessão |
| POST | `/api/v1/messages/send` | Envia mensagem com opções de delay |

---
Desenvolvido por [Paulo Adson](https://github.com/pauloadson)
