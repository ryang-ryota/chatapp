import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import FileUpload from "../components/FileUpload";
import MessageList from "../components/MessageList";

const socket = io("http://localhost:5000", { withCredentials: true });

export default function ChatPage({ user, setUser }) {
  const [users, setUsers] = useState([]);
  const [target, setTarget] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const messagesEndRef = useRef(null);

  // ユーザー一覧取得
  useEffect(() => {
    axios
      .get("/api/users", {
        withCredentials: true,
        baseURL: "http://localhost:5000",
      })
      .then((res) => setUsers(res.data));
  }, []);

  // メッセージ履歴取得
  useEffect(() => {
    if (target) {
      axios
        .get(`/api/messages/${target._id}`, {
          withCredentials: true,
          baseURL: "http://localhost:5000",
        })
        .then((res) => setMessages(res.data));
      socket.emit("join", user.id);
    }
  }, [target, user.id]);

  // Socket.IO受信
  useEffect(() => {
    socket.emit("join", user.id);
    socket.on("message", (msg) => {
      if (msg.from === target?._id || msg.to === target?._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => {
      socket.off("message");
    };
  }, [target, user.id]);

  // スクロール最下部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!content.trim() || !target) return;
    socket.emit("message", { from: user.id, to: target._id, content });
    setContent("");
  };

  const handleLogout = async () => {
    await axios.post(
      "/api/auth/logout",
      {},
      { withCredentials: true, baseURL: "http://localhost:5000" }
    );
    setUser(null);
  };

  return (
    <div className="flex h-screen">
      {/* サイドバー - ユーザーリスト */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* ヘッダー */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
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

        {/* ユーザーリスト */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              ユーザー一覧
            </h4>
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u._id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    target?._id === u._id
                      ? "bg-blue-100 border-2 border-blue-200"
                      : "hover:bg-gray-100 border-2 border-transparent"
                  }`}
                  onClick={() => setTarget(u)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-700 font-medium text-sm">
                        {u.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span
                      className={`font-medium ${
                        target?._id === u._id
                          ? "text-blue-700"
                          : "text-gray-800"
                      }`}
                    >
                      {u.username}
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
        {target ? (
          <>
            {/* チャットヘッダー */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-700 font-semibold text-sm">
                    {target.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {target.username}
                  </h3>
                  <p className="text-sm text-green-600">オンライン</p>
                </div>
              </div>
            </div>

            {/* メッセージエリア */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              <MessageList messages={messages} user={user} />
              <div ref={messagesEndRef} />
            </div>

            {/* メッセージ入力エリア */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSend} className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    rows="1"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="メッセージを入力..."
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
                  className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-colors duration-200 disabled:opacity-50"
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
                  targetType="private"
                  targetId={target?._id}
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                チャットを始めましょう
              </h3>
              <p className="text-gray-600">
                左側からユーザーを選択してチャットを開始してください
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
