# Render API Integration

## ✅ API Key olingan

API Key: `rnd_CHQ8WiiuK70Ond30MU1YCpQKwDgb`

## 📋 Service Ma'lumotlari

**Service Name:** `code-editor`
**Service ID:** `srv-d44jn3umcj7s73anqo00`
**URL:** `https://code-editor-3bgs.onrender.com`
**Status:** Active (not suspended)
**Region:** Oregon
**Branch:** `main`
**Auto Deploy:** Enabled

## 🔧 Render API'ni ishlatish

### 1. Service ma'lumotlarini olish

```bash
curl -H "Authorization: Bearer rnd_CHQ8WiiuK70Ond30MU1YCpQKwDgb" \
  https://api.render.com/v1/services/srv-d44jn3umcj7s73anqo00
```

### 2. Service'ni restart qilish

```bash
curl -X POST \
  -H "Authorization: Bearer rnd_CHQ8WiiuK70Ond30MU1YCpQKwDgb" \
  https://api.render.com/v1/services/srv-d44jn3umcj7s73anqo00/deploys
```

### 3. Log'larni olish

```bash
curl -H "Authorization: Bearer rnd_CHQ8WiiuK70Ond30MU1YCpQKwDgb" \
  https://api.render.com/v1/services/srv-d44jn3umcj7s73anqo00/logs
```

### 4. Environment variables'ni o'zgartirish

```bash
curl -X PUT \
  -H "Authorization: Bearer rnd_CHQ8WiiuK70Ond30MU1YCpQKwDgb" \
  -H "Content-Type: application/json" \
  -d '{"envVars": [{"key": "NODE_ENV", "value": "production"}]}' \
  https://api.render.com/v1/services/srv-d44jn3umcj7s73anqo00/env-vars
```

## 🚀 Key Features

### Service Status Monitoring
- Service holatini tekshirish
- Deploy status'ni ko'rish
- Health check natijalarini olish

### Deploy Management
- Manual deploy qilish
- Service'ni restart qilish
- Deploy log'larini ko'rish

### Environment Variables
- Environment variables'ni o'qish
- Environment variables'ni yangilash
- Yangi variable'lar qo'shish

### Logs Access
- Real-time log'larni olish
- Build log'larini ko'rish
- Runtime log'larini tekshirish

## 📚 Render API Documentation

To'liq API documentation: https://render.com/docs/api

## 🔐 Xavfsizlik

⚠️ **API Key'ni xavfsiz saqlang:**
- `.env.local` faylida saqlang (Git'ga commit qilmang)
- Faqat trusted services'da ishlating
- Agar key exposed bo'lsa, darhol yangi key yarating

## 🛠️ Cursor MCP Server Setup

Cursor'da Render MCP server'ini sozlash uchun:

1. Cursor Settings → Features → MCP Servers
2. Yoki `~/.cursor/mcp.json` faylini tahrirlang:

```json
{
  "mcpServers": {
    "render": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-render"],
      "env": {
        "RENDER_API_KEY": "rnd_CHQ8WiiuK70Ond30MU1YCpQKwDgb"
      }
    }
  }
}
```

3. Cursor'ni qayta ishga tushiring

## ✅ Test Qilish

API key to'g'ri ishlayapti va service ma'lumotlari muvaffaqiyatli olingan.

