import React, { useState } from "react";
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import GroupChatPage from "./pages/GroupChatPage";

function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("private"); // 'private' or 'group'

  if (!user) return <LoginPage setUser={setUser} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">
              チャットアプリ
            </h1>

            {/* タブ切り替えボタン */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  tab === "private"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setTab("private")}
              >
                1対1チャット
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  tab === "group"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setTab("group")}
              >
                グループチャット
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {tab === "private" ? (
            <ChatPage user={user} setUser={setUser} />
          ) : (
            <GroupChatPage user={user} setUser={setUser} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
