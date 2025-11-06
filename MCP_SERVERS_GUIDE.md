# MCP Servers Qo'llanmasi

Bu qo'llanmada sizning mcp.json faylida sozlangan MCP serverlar va ularni qanday ishlatish haqida ma'lumot berilgan.

## 📋 Sozlangan MCP Serverlar

### 1. 🚀 Render.com MCP Server
**Status:** ✅ Sozlangan
**API Key:** `rnd_CHQ8WiiuK70Ond30MU1YCpQKwDgb`

**Imkoniyatlar:**
- Render service'larini boshqarish
- Deploy status'ini ko'rish
- Log'larni ko'rish
- Environment variables'ni o'zgartirish
- Service'ni restart qilish

**Ishlatish:**
```
Men sizning Render service'larini boshqarishda yordam bera olaman
```

---

### 2. 📚 Swagger/SwaggerHub MCP Server
**Status:** ✅ Sozlangan
**API Key:** `1ef12eb0-a32e-4065-9a1e-43c748c2c5f7`

**Imkoniyatlar:**
- Swagger/OpenAPI spetsifikatsiyalarini yuklash
- API endpointlarini ko'rish va test qilish
- API dokumentatsiyasini ko'rish
- API so'rovlarini yuborish va javoblarni validatsiya qilish

**Ishlatish:**
```
Swagger API'ni yuklab, endpointlarni ko'rsating
```

---

### 3. 🎨 Figma MCP Server
**Status:** ⚠️ Token kerak

**Imkoniyatlar:**
- Figma dizaynlaridan kod generatsiya qilish
- Dizayn kontekstini olish (komponentlar, o'zgaruvchilar, layout)
- SVG ma'lumotlarini eksport qilish
- FigJam resurslarini olish

**Figma Token olish:**
1. Figma'ga kiring: https://www.figma.com
2. Settings → Account → Personal access tokens
3. "Create new token" tugmasini bosing
4. Token nomini kiriting (masalan: "Cursor MCP")
5. Yaratilgan token'ni nusxa oling (token `figd_` bilan boshlanadi)

**Token'ni qo'shish:**
`mcp.json` faylida `figma` bo'limiga token qo'shing:
```json
"figma": {
  "url": "https://mcp.figma.com/mcp",
  "headers": {
    "Authorization": "Bearer figd_your_token_here"
  }
}
```

---

### 4. 📝 Notion MCP Server
**Status:** ⚠️ API Key kerak

**Imkoniyatlar:**
- Notion sahifalarini o'qish va yozish
- Database'larni boshqarish
- Hujjatlarni ko'rish va tahrirlash
- Sahifalar yaratish

**Notion API Key olish:**
1. Notion'ga kiring: https://www.notion.so
2. Settings & Members → Connections → Develop or manage integrations
3. "+ New integration" tugmasini bosing
4. Integration nomini kiriting
5. Yaratilgan "Internal Integration Token" ni nusxa oling

**API Key'ni qo'shish:**
`mcp.json` faylida `notion` bo'limiga qo'shing:
```json
"notion": {
  "env": {
    "NOTION_API_KEY": "secret_your_api_key_here"
  }
}
```

---

## 🔧 Qo'shimcha Foydali MCP Serverlar

### GitHub MCP Server (qo'shish mumkin)
```json
"github": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github@latest"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
  }
}
```

**Imkoniyatlar:**
- Repository'larni boshqarish
- Issue'lar yaratish va yopish
- Pull request'lar yaratish
- Code'ni ko'rish va tahrirlash

**GitHub Token olish:**
1. GitHub → Settings → Developer settings → Personal access tokens
2. "Generate new token" → "Fine-grained token"
3. Repository permissions tanlang
4. Token'ni nusxa oling

---

### Google Drive/Sheets MCP Server (qo'shish mumkin)
```json
"google-drive": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-google-drive@latest"],
  "env": {
    "GOOGLE_CREDENTIALS": "path/to/credentials.json"
  }
}
```

**Imkoniyatlar:**
- Google Drive fayllarini o'qish/yozish
- Google Sheets'ni boshqarish
- Dokumentlarni ko'rish

---

### Filesystem MCP Server (lokal fayllar uchun)
```json
"filesystem": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem@latest"],
  "env": {
    "ALLOWED_DIRECTORIES": "/Users/edevzi/Desktop/untitled folder 3"
  }
}
```

**Imkoniyatlar:**
- Fayllarni o'qish/yozish
- Kataloglarni ko'rish
- Fayllarni qidirish

---

## 🚀 Qanday Ishlatish

1. **Cursor'ni qayta ishga tushiring:**
   - `Cmd + Shift + P` → "Reload Window"
   - Yoki Cursor'ni to'liq yoping va qayta oching

2. **MCP Server'ni test qiling:**
   - Chat'da: "Render service'larini ko'rsating"
   - Chat'da: "Swagger API'ni yuklab, endpointlarni ko'rsating"

3. **Token qo'shish:**
   - Yuqoridagi qo'llanmalarga ko'ra token/API key oling
   - `mcp.json` faylini yangilang
   - Cursor'ni qayta ishga tushiring

---

## 📝 Eslatmalar

- **Xavfsizlik:** Token'lar va API key'larni GitHub'ga push qilmaydigan qiling
- **Limitlar:** Har bir MCP server'ning o'z API limitlari bor
- **Yordam:** Muammo bo'lsa, Cursor'ni qayta ishga tushiring

---

## 🔗 Foydali Linklar

- [MCP Servers Katalogi](https://mcp.pizza)
- [Figma MCP Server Docs](https://help.figma.com/hc/en-us/articles/32132100833559)
- [Render MCP Server Docs](https://render.com/docs/mcp-server)
- [Notion API Docs](https://developers.notion.com)

