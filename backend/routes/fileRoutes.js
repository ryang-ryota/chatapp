const express = require("express");
const multer = require("multer");
const path = require("path");
const File = require("../models/File");
const Message = require("../models/Message");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", credentials: true },
});

const router = express.Router();

// Multerストレージ設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    // 一意なファイル名を生成
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ファイルアップロード
router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "未認証" });
  const { targetType, targetId } = req.body;
  if (!req.file || !targetType || !targetId)
    return res.status(400).json({ error: "不正なリクエスト" });

  // ファイル情報をDBに保存
  const fileDoc = await File.create({
    originalName: req.file.originalname,
    filename: req.file.filename,
    uploader: req.session.userId,
    targetType,
    targetId,
  });

  // ファイルメッセージをMessageに自動追加
  const messageData = {
    from: req.session.userId,
    type: "file",
    content: fileDoc.originalName,
    file: fileDoc._id,
    sentAt: new Date(),
  };
  if (targetType === "private") {
    messageData.to = targetId;
  } else if (targetType === "group") {
    messageData.group = targetId;
  }
  const messageDoc = await Message.create(messageData);

  io.to(targetId).emit("message", messageDoc);

  res.status(201).json({ file: fileDoc, message: messageDoc });
});

// ファイル一覧取得（チャット相手またはグループごと）
router.get("/:targetType/:targetId", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "未認証" });
  const { targetType, targetId } = req.params;
  const files = await File.find({ targetType, targetId });
  res.json(files);
});

// ファイルダウンロード
router.get("/download/:fileId", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "未認証" });
  const fileDoc = await File.findById(req.params.fileId);
  if (!fileDoc)
    return res.status(404).json({ error: "ファイルが見つかりません" });

  const filePath = path.resolve(__dirname, "../uploads", fileDoc.filename);
  res.download(filePath, fileDoc.originalName);
});

module.exports = router;
