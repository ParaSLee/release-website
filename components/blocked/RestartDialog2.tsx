/**
 * 第二层重启对话框
 * 120个随机英文单词输入验证
 */

import { useEffect, useState } from "react";

import { Check, Keyboard, X } from "lucide-react";

import { formatWordsForDisplay, getMatchPercentage, getWordCount, validateWordInput } from "~utils/wordGenerator";

interface RestartDialog2Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  generatedWords: string;
}

export const RestartDialog2: React.FC<RestartDialog2Props> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  generatedWords,
}) => {
  const [userInput, setUserInput] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setUserInput("");
      setIsValid(false);
      setMatchPercentage(0);
      setWordCount(0);
    }
  }, [isOpen]);

  // 实时验证用户输入
  useEffect(() => {
    const isMatch = validateWordInput(generatedWords, userInput);
    setIsValid(isMatch);

    const percentage = getMatchPercentage(generatedWords, userInput);
    setMatchPercentage(percentage);

    const count = getWordCount(userInput);
    setWordCount(count);
  }, [userInput, generatedWords]);

  if (!isOpen) return null;

  const formattedWords = formatWordsForDisplay(generatedWords);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col animate-slide-up">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">文字验证</h2>
              <p className="text-sm text-gray-500">请输入以下文字以确认重启</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 文本显示区 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              请输入以下 120 个英文单词（可复制）：
            </label>
            <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
              <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap leading-relaxed select-all">
                {formattedWords}
              </pre>
            </div>
          </div>

          {/* 输入区 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                在此输入：
              </label>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">
                  单词数: <span className="font-semibold">{wordCount}</span> / 120
                </span>
                <span
                  className={`font-semibold ${
                    matchPercentage >= 100
                      ? "text-green-600"
                      : matchPercentage >= 80
                      ? "text-orange-600"
                      : "text-red-600"
                  }`}
                >
                  匹配度: {matchPercentage}%
                </span>
              </div>
            </div>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="请输入上方显示的所有单词..."
              className={`w-full h-48 p-4 border-2 rounded-lg font-mono text-sm resize-none focus:outline-none transition-colors ${
                isValid
                  ? "border-green-500 bg-green-50 focus:border-green-600"
                  : userInput.length > 0
                  ? "border-red-500 bg-red-50 focus:border-red-600"
                  : "border-gray-300 focus:border-blue-500"
              }`}
            />
            {isValid && (
              <div className="mt-2 flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">✅ 输入正确！可以点击确定按钮</span>
              </div>
            )}
            {!isValid && userInput.length > 0 && (
              <div className="mt-2 text-sm text-red-600">
                ⚠️ 输入不匹配，请仔细检查（包括大小写、空格、标点）
              </div>
            )}
          </div>

          {/* 提示信息 */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 提示：
            </p>
            <ul className="text-sm text-blue-700 list-disc list-inside mt-2 space-y-1">
              <li>您可以复制上方的单词并粘贴到输入框</li>
              <li>必须完全匹配（包括大小写、空格、标点）</li>
              <li>输入正确后"确定"按钮才会变为可点击状态</li>
              <li>这个验证旨在增加重启的操作成本，帮助您三思而后行</li>
            </ul>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              disabled={!isValid}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${
                isValid
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Check className="w-5 h-5" />
              确定重启
            </button>
            <button
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              取消重启 (坚持自律)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

