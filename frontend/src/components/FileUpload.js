import React, { useRef, useState } from "react";
import axios from "axios";

export default function FileUpload({ user, targetType, targetId, onUploaded }) {
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e) => {
    setError("");
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetType", targetType);
      formData.append("targetId", targetId);

      const res = await axios.post(
        "http://localhost:5000/api/files/upload",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      onUploaded && onUploaded(res.data.message); // メッセージとして追加
      fileInputRef.current.value = "";
    } catch (err) {
      setError("アップロード失敗");
    }
    setUploading(false);
  };

  return (
    <div className="flex items-center gap-3 ml-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
        disabled={uploading}
      />

      {/* ファイル選択ボタン */}
      <label
        htmlFor="file-upload"
        className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
          uploading
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border border-blue-200"
        }`}
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
          />
        </svg>
        {uploading ? "アップロード中..." : "ファイル添付"}
      </label>

      {/* アップロード中のローディング表示 */}
      {uploading && (
        <div className="flex items-center text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
          <span className="text-sm">処理中...</span>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-200">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}
