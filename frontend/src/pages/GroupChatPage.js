import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import FileUpload from "../components/FileUpload";
import MessageList from "../components/MessageList";

const socket = io("http://localhost:5000", { withCredentials: true });

export default function GroupChatPage({ user, setUser }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [groupName, setGroupName] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const messagesEndRef = useRef(null);

  // グループ一覧取得
  useEffect(() => {
    fetchGroups();
    fetchAllUsers();
  }, []);

  const fetchGroups = async () => {
    const res = await axios.get("/api/groups", {
      withCredentials: true,
      baseURL: "http://localhost:5000",
    });
    setGroups(res.data);
  };

  const fetchAllUsers = async () => {
    const res = await axios.get("/api/users", {
      withCredentials: true,
      baseURL: "http://localhost:5000",
    });
    setAllUsers(res.data);
  };

  // グループ選択時、履歴取得＆Socket部屋join
  useEffect(() => {
    if (selectedGroup) {
      axios
        .get(`/api/group-messages/${selectedGroup._id}`, {
          withCredentials: true,
          baseURL: "http://localhost:5000",
        })
        .then((res) => setMessages(res.data));
      socket.emit("join-group", selectedGroup._id);
    }
  }, [selectedGroup]);

  // Socket.IO受信
  useEffect(() => {
    socket.on("group-message", (msg) => {
      if (msg.group === selectedGroup?._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => {
      socket.off("group-message");
    };
  }, [selectedGroup]);

  // スクロール最下部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // グループ作成
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedMembers.length === 0) return;
    await axios.post(
      "/api/groups",
      { name: groupName, memberIds: selectedMembers },
      { withCredentials: true, baseURL: "http://localhost:5000" }
    );
    setGroupName("");
    setSelectedMembers([]);
    setShowCreateForm(false);
    fetchGroups();
  };

  // メッセージ送信
  const handleSend = (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedGroup) return;
    socket.emit("group-message", {
      from: user.id,
      group: selectedGroup._id,
      content,
    });
    setContent("");
  };

  // ログアウト
  const handleLogout = async () => {
    await axios.post(
      "/api/auth/logout",
      {},
      { withCredentials: true, baseURL: "http://localhost:5000" }
    );
    setUser(null);
  };

  // メンバー選択
  const handleMemberSelect = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="flex h-screen">
      {/* サイドバー - グループリスト */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* ヘッダー */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{user.username}</h3>
                <p className="text-sm text-green-600">オンライン</p>
              </div>
            </div>
            <button
              className="text-gray-400 hover:text-red-500 transition-colors duration-200"
              onClick={handleLogout}
              title="ログアウト"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* グループ作成ボタン */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            新しいグループを作成
          </button>
        </div>

        {/* グループ作成フォーム */}
        {showCreateForm && (
          <div className="p-4 bg-blue-50 border-b border-gray-200">
            <form onSubmit={handleCreateGroup} className="space-y-3">
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="グループ名を入力"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メンバーを選択:
                </label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {allUsers.map((u) => (
                    <label key={u._id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(u._id)}
                        onChange={() => handleMemberSelect(u._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {u.username}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  作成
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {/* グループリスト */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              グループ一覧
            </h4>
            <div className="space-y-2">
              {groups.map((g) => (
                <div
                  key={g._id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedGroup?._id === g._id
                      ? "bg-green-100 border-2 border-green-200"
                      : "hover:bg-gray-100 border-2 border-transparent"
                  }`}
                  onClick={() => setSelectedGroup(g)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <span
                      className={`font-medium ${
                        selectedGroup?._id === g._id
                          ? "text-green-700"
                          : "text-gray-800"
                      }`}
                    >
                      {g.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* メインチャットエリア */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedGroup ? (
          <>
            {/* チャットヘッダー */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {selectedGroup.name}
                  </h3>
                  <p className="text-sm text-gray-600">グループチャット</p>
                </div>
              </div>
            </div>

            {/* メッセージエリア */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              <MessageList messages={messages} user={user} isGroup />
              <div ref={messagesEndRef} />
            </div>

            {/* メッセージ入力エリア */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSend} className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    rows="1"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="グループにメッセージを送信..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  disabled={!content.trim()}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
                <FileUpload
                  user={user}
                  targetType="group"
                  targetId={selectedGroup?._id}
                  onUploaded={(msg) => setMessages((prev) => [...prev, msg])}
                />
              </form>
            </div>
          </>
        ) : (
          /* 未選択状態 */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                グループチャットを始めましょう
              </h3>
              <p className="text-gray-600">
                左側からグループを選択するか、新しいグループを作成してください
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
