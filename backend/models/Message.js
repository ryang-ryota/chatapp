const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // 1対1用
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" }, // グループ用
  content: { type: String }, // テキストまたはファイル名/URL
  type: { type: String, enum: ["text", "file"], default: "text" }, // メッセージ種別
  file: { type: mongoose.Schema.Types.ObjectId, ref: "File" }, // ファイルメッセージの場合
  sentAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
