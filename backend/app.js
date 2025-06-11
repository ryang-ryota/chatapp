/**
 * チャットアプリ サーバーサイド
 */
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const User = require("./models/User");
const Message = require("./models/Message");
const groupRoutes = require("./routes/groupRoutes");
const fileRoutes = require("./routes/fileRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", credentials: true },
});

// --- ミドルウェア ---
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true },
  })
);
app.use("/api/groups", groupRoutes);
app.use("/api/files", fileRoutes);
app.use(
  "/uploads",
  express.static(require("path").resolve(__dirname, "uploads"))
);

// --- MongoDB接続 ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("[INFO] MongoDB connected"))
  .catch((err) => console.error("[ERROR] MongoDB connection:", err));

// --- 認証API ---
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Missing fields" });
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, password: hash });
    req.session.userId = user._id;
    res.json({ id: user._id, username: user.username });
  } catch (err) {
    res.status(400).json({ error: "ユーザー名が既に存在しています" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: "ユーザーが見つかりません" });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "パスワードが違います" });
  req.session.userId = user._id;
  res.json({ id: user._id, username: user.username });
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

// --- ユーザー一覧API ---
app.get("/api/users", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "未認証" });
  const users = await User.find(
    { _id: { $ne: req.session.userId } },
    "username"
  );
  res.json(users);
});

// --- メッセージ履歴API ---
app.get("/api/messages/:userId", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "未認証" });
  const myId = req.session.userId;
  const otherId = req.params.userId;
  const messages = await Message.find({
    $or: [
      { from: myId, to: otherId },
      { from: otherId, to: myId },
    ],
  })
    .sort({ sentAt: 1 })
    .populate("file");
  res.json(messages);
});

// グループメッセージ履歴取得
app.get("/api/group-messages/:groupId", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "未認証" });
  const messages = await Message.find({ group: req.params.groupId })
    .sort({ sentAt: 1 })
    .populate("file");
  res.json(messages);
});

// --- Socket.IO認証 ---
io.use((socket, next) => {
  const sessionID = socket.handshake.headers.cookie?.split("=")[1];
  // 本番運用時はcookieパースやセッションストア連携を厳密に
  next();
});

// --- Socket.IOチャット ---
io.on("connection", (socket) => {
  console.log("[INFO] Socket connected:", socket.id);

  // 個人チャット用
  socket.on("join", (userId) => {
    socket.join(userId);
  });

  // グループチャット用
  socket.on("join-group", (groupId) => {
    socket.join(groupId);
  });

  // 個人チャットメッセージ
  socket.on("message", async (data) => {
    // data: { from, to, content }
    const message = await Message.create(data);
    io.to(data.to).emit("message", message);
    io.to(data.from).emit("message", message);
  });

  // グループチャットメッセージ
  socket.on("group-message", async (data) => {
    // data: { from, group, content }
    const message = await Message.create(data);
    io.to(data.group).emit("group-message", message);
  });

  socket.on("disconnect", () => {
    console.log("[INFO] Socket disconnected:", socket.id);
  });
});

// --- サーバー起動 ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[INFO] Server running on http://localhost:${PORT}`);
});
