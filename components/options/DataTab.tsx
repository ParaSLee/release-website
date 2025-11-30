/**
 * 数据管理Tab
 */

import { useState } from "react";

import { Database, Download, Trash2, Upload } from "lucide-react";

import { clearAllStorage } from "~hooks/useStorage";
import { STORAGE_KEYS } from "~types";

export const DataTab: React.FC = () => {
  const [importing, setImporting] = useState(false);

  /**
   * 导出数据
   */
  const handleExport = async () => {
    try {
      // 获取所有数据
      const data = await chrome.storage.local.get(null);

      // 创建JSON文件
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // 下载文件
      const a = document.createElement("a");
      a.href = url;
      a.download = `website-block-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();

      URL.revokeObjectURL(url);
      alert("数据导出成功！");
    } catch (error) {
      console.error("[DataTab] 导出失败:", error);
      alert("导出失败，请重试");
    }
  };

  /**
   * 导入数据
   */
  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        setImporting(true);

        const text = await file.text();
        const data = JSON.parse(text);

        // 验证数据格式
        if (!data || typeof data !== "object") {
          throw new Error("无效的数据格式");
        }

        // 确认导入
        if (
          !confirm(
            "导入数据将覆盖当前所有配置和使用记录。确定要继续吗？\n\n建议先导出当前数据作为备份。"
          )
        ) {
          setImporting(false);
          return;
        }

        // 导入数据
        await chrome.storage.local.clear();
        await chrome.storage.local.set(data);

        alert("数据导入成功！页面将刷新以应用新配置。");
        window.location.reload();
      } catch (error) {
        console.error("[DataTab] 导入失败:", error);
        alert("导入失败，请检查文件格式");
      } finally {
        setImporting(false);
      }
    };

    input.click();
  };

  /**
   * 清空所有数据
   */
  const handleClearAll = async () => {
    if (
      !confirm(
        "确定要清空所有数据吗？\n\n这将删除：\n- 所有网站配置\n- 所有使用记录\n- 所有设置\n\n此操作不可撤销！"
      )
    ) {
      return;
    }

    if (!confirm("最后确认：真的要删除所有数据吗？")) {
      return;
    }

    try {
      await clearAllStorage();
      alert("所有数据已清空！页面将刷新。");
      window.location.reload();
    } catch (error) {
      console.error("[DataTab] 清空失败:", error);
      alert("清空失败，请重试");
    }
  };

  /**
   * 获取存储统计
   */
  const getStorageStats = async () => {
    try {
      const data = await chrome.storage.local.get(null);
      const jsonStr = JSON.stringify(data);
      const bytes = new Blob([jsonStr]).size;

      return {
        bytes,
        kb: (bytes / 1024).toFixed(2),
        items: Object.keys(data).length,
      };
    } catch (error) {
      console.error("[DataTab] 获取统计失败:", error);
      return { bytes: 0, kb: "0", items: 0 };
    }
  };

  const [stats, setStats] = useState<{ bytes: number; kb: string; items: number } | null>(null);

  useState(() => {
    getStorageStats().then(setStats);
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* 头部 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">数据管理</h2>
          <p className="text-gray-600 mt-1">导入、导出和管理你的配置数据</p>
        </div>

        {/* 存储统计 */}
        {stats && (
          <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">存储统计</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">存储大小</div>
                <div className="text-2xl font-bold text-blue-600">{stats.kb} KB</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">数据项数量</div>
                <div className="text-2xl font-bold text-indigo-600">{stats.items}</div>
              </div>
            </div>
          </div>
        )}

        {/* 导出数据 */}
        <div className="mb-6 p-6 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Download className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">导出数据</h3>
              <p className="text-sm text-gray-600 mb-4">
                将所有配置和使用数据导出为JSON文件，可用于备份或迁移到其他设备。
              </p>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                <Download className="w-5 h-5" />
                导出数据
              </button>
            </div>
          </div>
        </div>

        {/* 导入数据 */}
        <div className="mb-6 p-6 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Upload className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">导入数据</h3>
              <p className="text-sm text-gray-600 mb-4">
                从之前导出的JSON文件恢复配置和数据。导入会覆盖当前所有数据。
              </p>
              <button
                onClick={handleImport}
                disabled={importing}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Upload className="w-5 h-5" />
                {importing ? "导入中..." : "导入数据"}
              </button>
            </div>
          </div>
        </div>

        {/* 清空数据 */}
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Trash2 className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">清空所有数据</h3>
              <p className="text-sm text-gray-600 mb-4">
                删除所有网站配置、使用记录和设置。此操作不可撤销，建议先导出备份！
              </p>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                <Trash2 className="w-5 h-5" />
                清空所有数据
              </button>
            </div>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>💡 提示：</strong>
          </p>
          <ul className="text-sm text-yellow-700 list-disc list-inside mt-2 space-y-1">
            <li>定期导出数据可以防止意外丢失配置</li>
            <li>导入数据前建议先导出当前数据作为备份</li>
            <li>导出的JSON文件可以在文本编辑器中查看和编辑</li>
            <li>数据仅存储在本地，不会上传到任何服务器</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

