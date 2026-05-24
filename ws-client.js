// ═══════════════════════════════════════════════════════
// MARKET WARS — WebSocket Client
// ใส่ script นี้ใน HTML แทน game loop เดิม
// ═══════════════════════════════════════════════════════

// ── CONFIG ──────────────────────────────────────────
// เปลี่ยน URL ให้ตรงกับ server ที่ deploy
const WS_URL = "ws://localhost:3001"; // local
// const WS_URL = "wss://your-app.onrender.com"; // production

// ── MARKET WARS CLIENT CLASS ─────────────────────────
class MarketWarsClient {
  constructor(onMessage) {
    this.ws = null;
    this.connected = false;
    this.reconnectTimer = null;
    this.onMessage = onMessage; // callback รับทุก message
    this.pingTimer = null;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      this.connected = true;
      console.log("✅ Connected to Market Wars Server");
      this.onMessage({ type: "CONNECTED" });
      // Ping ทุก 25s เพื่อ keep-alive
      this.pingTimer = setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: "PING" }));
        }
      }, 25000);
    };

    this.ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        this.onMessage(data);
      } catch (err) {
        console.error("Parse error:", err);
      }
    };

    this.ws.onclose = () => {
      this.connected = false;
      clearInterval(this.pingTimer);
      console.log("❌ Disconnected — reconnecting in 3s...");
      this.onMessage({ type: "DISCONNECTED" });
      // Auto-reconnect
      this.reconnectTimer = setTimeout(() => this.connect(), 3000);
    };

    this.ws.onerror = (err) => {
      console.error("WS Error:", err);
    };
  }

  send(type, payload = {}) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...payload }));
    } else {
      console.warn("Not connected — cannot send:", type);
    }
  }

  // ── ACTION METHODS ─────────────────────────────────
  join(nick, roomCode, mode, endMode, target, duration) {
    this.send("JOIN", { nick, roomCode, mode, endMode, target, duration });
  }

  toggleReady() {
    this.send("READY");
  }

  startGame() {
    this.send("START");
  }

  buy(assetId, qty) {
    this.send("TRADE", { action: "buy", assetId, qty });
  }

  sell(assetId, qty) {
    this.send("TRADE", { action: "sell", assetId, qty });
  }

  gamble(game, bet, choice) {
    this.send("GAMBLE", { game, bet, choice });
  }

  chat(text) {
    this.send("CHAT", { text });
  }

  getState() {
    this.send("GET_STATE");
  }

  disconnect() {
    clearInterval(this.pingTimer);
    clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }
}

// ═══════════════════════════════════════════════════════
// วิธีใช้ใน React component:
// ═══════════════════════════════════════════════════════
/*

// 1. สร้าง client ใน useEffect
const clientRef = useRef(null);

useEffect(() => {
  const client = new MarketWarsClient((msg) => handleServerMessage(msg));
  clientRef.current = client;
  client.connect();
  return () => client.disconnect();
}, []);

// 2. Handle messages จาก server
function handleServerMessage(msg) {
  switch (msg.type) {
    case "CONNECTED":
      setServerConnected(true);
      break;

    case "DISCONNECTED":
      setServerConnected(false);
      break;

    case "JOINED":
      // เข้าห้องสำเร็จ
      setSession({ ...msg, code: msg.roomCode });
      setPlayers(msg.players);
      setScreen("waiting");
      break;

    case "REJOINED":
      // กลับเข้าห้องหลัง disconnect
      setCash(msg.cash);
      setHold(msg.hold);
      setBasis(msg.basis);
      setPrices(msg.prices);
      setScreen("game");
      break;

    case "PLAYER_JOINED":
      // คนอื่นเข้าห้อง
      setPlayers(prev => [...prev, { id: msg.playerId, nick: msg.nick }]);
      break;

    case "PLAYER_READY":
      setPlayers(prev => prev.map(p =>
        p.id === msg.playerId ? { ...p, ready: msg.ready } : p
      ));
      break;

    case "GAME_START":
      // เกมเริ่ม — server ส่ง initial state
      setCash(msg.startMoney);
      setHold({});
      setPrices(msg.prices);
      setTimeLeft(msg.duration);
      setScreen("game");
      break;

    case "TICK":
      // ทุก 1 วินาที — update ทุกอย่าง
      setPrices(msg.prices);
      setTimeLeft(msg.timeLeft);
      setPhase(msg.phase);
      setActiveEv(msg.activeEvent);
      setEvTimer(msg.eventTimer);
      setBoard(msg.board);
      setHypeIdx(msg.hypeIdx);
      break;

    case "TRADE_RESULT":
      if (msg.ok) {
        setCash(msg.cash);
        setHold(msg.hold);
        showNotif(
          msg.action === "buy"
            ? `▲ ซื้อ ×${msg.qty} −฿${Math.round(msg.cost).toLocaleString()}`
            : `▼ ขาย ×${msg.qty} +฿${Math.round(msg.gain).toLocaleString()}`,
          msg.action === "buy" ? "#4ade80" : "#38bdf8"
        );
      } else {
        showNotif(`❌ ${msg.msg}`, "#f87171");
      }
      break;

    case "INCOME":
      setCash(prev => prev + msg.amount);
      showNotif(msg.msg, "#fbbf24");
      break;

    case "EVENT":
      setActiveEv(msg.event);
      showNotif(msg.event.title, "#fbbf24");
      break;

    case "MINI_EVENT":
      showNotif(msg.msg, msg.change > 0 ? "#4ade80" : "#f87171");
      break;

    case "GAMBLE_RESULT":
      if (msg.ok) {
        setCash(msg.cash);
        setGWin(msg.gWin);
        setGLoss(msg.gLoss);
        showNotif(msg.msg, msg.win ? "#4ade80" : "#f87171");
      } else {
        showNotif(`❌ ${msg.msg}`, "#f87171");
      }
      break;

    case "CHAT":
      setChatMsgs(prev => [...prev.slice(-60), msg.msg]);
      break;

    case "PLAYER_DISCONNECTED":
      showNotif(`${msg.nick} หลุดออกจากเกม`, "#f87171");
      break;

    case "GAME_OVER":
      setScreen("result");
      setResult(msg);
      break;

    case "ERROR":
      showNotif(`❌ ${msg.msg}`, "#f87171");
      break;
  }
}

// 3. ส่ง action ไป server
const handleBuy = (assetId, qty) => {
  clientRef.current?.buy(assetId, qty);
};
const handleSell = (assetId, qty) => {
  clientRef.current?.sell(assetId, qty);
};
const handleGamble = (game, bet, choice) => {
  clientRef.current?.gamble(game, bet, choice);
};
const handleChat = (text) => {
  clientRef.current?.chat(text);
};

*/
