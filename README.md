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

> ⚠️ **Nota:** No momento, o ZapBridge suporta apenas **uma sessão (instância) ativa por vez**.

### 1. Gerenciamento de Sessão
- **Sessão Única**: Gerenciamento de uma única instância do WhatsApp Web.
- **QR Code**: Geração de QR Code em Base64 para autenticação.
- **Status da Conexão**: Verificação em tempo real se a instância está conectada.
- **Desconexão/Logout**: Encerramento seguro da sessão e limpeza dos dados de autenticação.
- **Reinicialização**: Comando para reiniciar o serviço de conexão.

### 2. Envio de Mensagens Inteligente
- **Envio Simples**: Envio de mensagens de texto para qualquer número.
- **Edição de Mensagens**: Possibilidade de editar mensagens enviadas anteriormente através do parâmetro `editMessageId`.
- **Delay de Mensagem (`delayMessage`)**: Intervalo configurável (em segundos) entre o processamento e o envio real da mensagem (Padrão: 1-3s aleatório).
- **Simulação de Digitação (`delayTyping`)**: Exibe o status "Digitando..." no WhatsApp do destinatário por um tempo determinado (em segundos).

### 3. Conexão Estável
- **Versionamento Dinâmico**: Busca automaticamente a versão mais recente do WhatsApp Web para evitar erros de conexão (como o erro 405).
- **Emulação de Browser**: Utiliza perfis de browser modernos (Desktop) para maior compatibilidade.
- **Ambientes Isolados**: Suporte nativo para configurações distintas de Desenvolvimento e Produção no mesmo arquivo `.env`.

### 4. Segurança
- **Autenticação via Bearer Token**: Proteção de endpoints sensíveis (Sessão e Mensagens) utilizando uma chave de API configurável por ambiente.

### 5. Monitoramento
- **Health Check**: Endpoint para verificar a integridade e o uptime do serviço.

## 🚀 Como Executar

### Pré-requisitos
- Node.js (v20 ou superior recomendado)
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

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` baseado no `.env.example`:
```bash
cp .env.example .env
```
Edite o arquivo `.env`. O sistema selecionará automaticamente as variáveis com base no `NODE_ENV` (`development` ou `production`):

```env
NODE_ENV=development

# Variáveis usadas em desenvolvimento
API_KEY_DEV=chave_dev
BASE_URL_DEV=http://localhost:3000

# Variáveis usadas em produção
API_KEY_PROD=chave_prod_super_segura
BASE_URL_PROD=https://sua-api.com
```

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

A documentação interativa da API adapta-se automaticamente à sua `BASE_URL` configurada:
- **UI**: `http://localhost:3000/docs` (ou sua URL de produção)
- **JSON**: `/docs.json`

## 🔐 Autenticação

Todos os endpoints (exceto `/api/v1/health`) requerem autenticação via Bearer Token.

No cabeçalho da requisição, inclua:
`Authorization: Bearer SEU_API_KEY`

## 🛣️ Principais Endpoints

| Método | Rota | Descrição | Requer Auth |
|--------|------|-------------|-------------|
| GET | `/api/v1/health` | Status da API | Não |
| GET | `/api/v1/session/status` | Status da conexão WhatsApp | Sim |
| GET | `/api/v1/session/qr` | Obtém o QR Code atual (Base64) | Sim |
| POST | `/api/v1/session/disconnect` | Desconecta e limpa a sessão | Sim |
| POST | `/api/v1/session/restart` | Reinicia o serviço de conexão | Sim |
| POST | `/api/v1/messages/send` | Envia ou edita mensagem com opções de delay | Sim |

### Exemplo de Envio de Mensagem

**POST** `/api/v1/messages/send`
```json
{
  "phone": "5511999999999",
  "message": "Olá, esta é uma mensagem de teste!",
  "delayTyping": 5,
  "delayMessage": 2
}
```

### Exemplo de Edição de Mensagem

**POST** `/api/v1/messages/send`
```json
{
  "phone": "5511999999999",
  "message": "Esta mensagem foi editada!",
  "editMessageId": "ABC123XYZ"
}
```

---
Desenvolvido por [Paulo Adson](https://github.com/pauloadson)
