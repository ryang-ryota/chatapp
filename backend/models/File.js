const mongoose = require("mongoose");

/**
 * ファイル情報管理用モデル
 */
const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true }, // 元のファイル名
  filename: { type: String, required: true }, // サーバー保存名
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  targetType: { type: String, enum: ["private", "group"], required: true }, // チャット種別
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // 相手ユーザーまたはグループID
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("File", fileSchema);
