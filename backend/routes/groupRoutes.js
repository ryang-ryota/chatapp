const express = require("express");
const router = express.Router();
const Group = require("../models/Group");
const User = require("../models/User");

// グループ一覧取得（自分が所属するグループのみ）
router.get("/", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "未認証" });
  const groups = await Group.find({ members: req.session.userId });
  res.json(groups);
});

// グループ作成
router.post("/", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "未認証" });
  const { name, memberIds } = req.body;
  if (!name || !Array.isArray(memberIds))
    return res.status(400).json({ error: "不正なリクエスト" });
  // 作成者自身もメンバーに含める
  const members = Array.from(new Set([...memberIds, req.session.userId]));
  const group = await Group.create({
    name,
    admin: req.session.userId,
    members,
  });
  res.status(201).json(group);
});

// グループ詳細取得
router.get("/:groupId", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "未認証" });
  const group = await Group.findById(req.params.groupId).populate(
    "members",
    "username"
  );
  if (!group)
    return res.status(404).json({ error: "グループが見つかりません" });
  res.json(group);
});

module.exports = router;
