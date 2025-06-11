function isImage(filename) {
  return /\.(png|jpe?g|gif|svg|webp)$/i.test(filename);
}

function getFileIcon(filename) {
  const extension = filename.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "pdf":
      return "";
    case "doc":
    case "docx":
      return "";
    case "xls":
    case "xlsx":
      return "";
    case "zip":
    case "rar":
      return "";
    case "mp4":
    case "avi":
    case "mov":
      return "";
    case "mp3":
    case "wav":
      return "";
    default:
      return "";
  }
}

export default function MessageList({ messages, user }) {
  return (
    <div className="space-y-4 p-4">
      {messages.map((msg, i) => {
        const isOwnMessage = msg.from === user.id;

        if (msg.type === "file" && msg.file) {
          const fileUrl = `http://localhost:5000/uploads/${msg.file.filename}`;

          return (
            <div
              key={i}
              className={`flex ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md ${
                  isOwnMessage
                    ? "bg-blue-500 text-white"
                    : "bg-white border border-gray-200"
                } rounded-2xl p-3 shadow-sm`}
              >
                {isImage(msg.file.originalName) ? (
                  /* 画像ファイルの表示 */
                  <div className="space-y-2">
                    <img
                      src={fileUrl}
                      alt={msg.file.originalName}
                      className="rounded-lg max-w-full h-auto max-h-60 object-cover border"
                      style={{ background: "#fff" }}
                    />
                    <p
                      className={`text-xs ${
                        isOwnMessage ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {msg.file.originalName}
                    </p>
                  </div>
                ) : (
                  /* 一般ファイルの表示 */
                  <a
                    href={fileUrl}
                    className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                      isOwnMessage
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={msg.file.originalName}
                  >
                    <span className="text-2xl">
                      {getFileIcon(msg.file.originalName)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isOwnMessage ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {msg.file.originalName}
                      </p>
                      <p
                        className={`text-xs ${
                          isOwnMessage ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        ファイルをダウンロード
                      </p>
                    </div>
                    <svg
                      className={`w-4 h-4 ${
                        isOwnMessage ? "text-blue-200" : "text-gray-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          );
        }

        // テキストメッセージ
        return (
          <div
            key={i}
            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                isOwnMessage
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800 border border-gray-200"
              }`}
            >
              <p className="text-sm leading-relaxed break-words">
                {msg.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
