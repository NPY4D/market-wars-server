# Market Wars — คู่มือ Deploy Server

## ภาพรวม
```
เพื่อน A (Bangkok) ←──WebSocket──→ Server (Cloud) ←──WebSocket──→ เพื่อน B (Chiang Mai)
                                        ↑
                              รัน game loop, sync ราคา,
                              จัดการ trade, broadcast ทุกอย่าง
```

---

## 1. ติดตั้งและรัน Local (ทดสอบเครื่องเดียวก่อน)

```bash
# ไปที่ folder server
cd market-wars-server

# ติดตั้ง dependencies
npm install

# รัน server
npm start
# หรือ dev mode (auto-restart เมื่อแก้โค้ด)
npm run dev
```

เปิด browser ไปที่ `http://localhost:3002/status`
จะเห็น JSON แสดงจำนวน rooms และ players

---

## 2. Deploy บน Render.com (ฟรี, แนะนำสุด)

### ขั้นตอน:

**1. สร้าง GitHub repo**
```bash
cd market-wars-server
git init
git add .
git commit -m "initial server"
# สร้าง repo บน github.com แล้ว push
git remote add origin https://github.com/YOUR_USERNAME/market-wars-server.git
git push -u origin main
```

**2. ไปที่ render.com → New → Web Service**
- Connect GitHub repo
- Build Command: `npm install`
- Start Command: `npm start`
- Instance Type: **Free**

**3. เปลี่ยน WS_URL ใน ws-client.js**
```javascript
// แทน localhost ด้วย URL จาก Render
const WS_URL = "wss://market-wars-server.onrender.com";
```

> ⚠️ Free tier บน Render จะ sleep หลัง 15 นาทีไม่มีคน
> ครั้งแรกที่มีคนเข้าจะใช้เวลา ~30 วินาที wake up
> ถ้าจะเล่นจริงจังให้อัปเกรด $7/เดือน

---

## 3. Deploy บน Railway (ฟรี $5 credit/เดือน)

```bash
# ติดตั้ง Railway CLI
npm install -g @railway/cli

# login และ deploy
railway login
railway init
railway up
```

URL จะได้มาอัตโนมัติ เช่น `market-wars-production.up.railway.app`

---

## 4. Deploy บน Fly.io (ฟรี tier มีอยู่)

```bash
# ติดตั้ง flyctl
curl -L https://fly.io/install.sh | sh

# สร้าง fly.toml
fly launch
fly deploy
```

---

## 5. ทดสอบ WebSocket Connection

เปิด browser console แล้วรัน:
```javascript
const ws = new WebSocket("wss://YOUR-SERVER-URL");
ws.onopen = () => ws.send(JSON.stringify({ type: "JOIN", nick: "Test", roomCode: "ABC123", mode: "casual", endMode: "time", duration: 300 }));
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

---

## 6. ใส่ ws-client.js เข้า HTML

เพิ่มใน `<head>` ของ market-wars.html:
```html
<script>
// วาง code จาก ws-client.js ทั้งหมดตรงนี้
// หรือ
</script>
<script src="ws-client.js"></script>
```

แล้วแก้ GameScreen component:
- ลบ `setInterval` game loop เดิมออก
- ใช้ MarketWarsClient แทน
- ดู comment ในไฟล์ ws-client.js

---

## 7. Environment Variables (ถ้าต้องการ)

สร้างไฟล์ `.env`:
```
PORT=3001
```

---

## โครงสร้าง Messages

### Client → Server
| type | payload | ความหมาย |
|------|---------|-----------|
| JOIN | nick, roomCode, mode, endMode, target, duration | เข้าห้อง |
| READY | — | toggle ready |
| START | — | host เริ่มเกม (manual) |
| TRADE | action, assetId, qty | ซื้อ/ขาย |
| GAMBLE | game, bet, choice | เล่นพนัน |
| CHAT | text | ส่งข้อความ |
| GET_STATE | — | ขอ state ปัจจุบัน |

### Server → Client
| type | payload | ความหมาย |
|------|---------|-----------|
| JOINED | playerId, players, ... | เข้าห้องสำเร็จ |
| REJOINED | cash, hold, prices, ... | กลับเข้าหลัง disconnect |
| PLAYER_JOINED | playerId, nick | คนอื่นเข้าห้อง |
| GAME_START | prices, duration, startMoney | เกมเริ่ม |
| TICK | prices, timeLeft, board, ... | ทุก 1 วินาที |
| TRADE_RESULT | ok, cash, hold, ... | ผลการเทรด |
| INCOME | amount, msg | passive income |
| EVENT | event | market event |
| MINI_EVENT | msg, assetId, change | mini event |
| GAMBLE_RESULT | ok, win, amount, ... | ผลพนัน |
| CHAT | msg | ข้อความ chat |
| GAME_OVER | board, winner | เกมจบ |
| ERROR | msg | error |
