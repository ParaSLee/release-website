/**
 * 固定时间限制Tab
 */

import { useState } from "react";

import { Moon, Plus, Trash2 } from "lucide-react";

import { useTimeLock } from "~hooks/useTimeLock";
import type { TimeLockPeriod } from "~types";
import { formatTimeLockPeriod, validateTimeLockPeriod } from "~utils/timeLock";

export const TimeLockTab: React.FC = () => {
  const { settings, updateSettings, addPeriod, deletePeriod } = useTimeLock();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    startTime: "22:00",
    endTime: "06:00",
    label: "",
  });

  /**
   * 切换总开关
   */
  const handleToggleEnabled = async () => {
    await updateSettings({ enabled: !settings.enabled });
  };

  /**
   * 切换模式
   */
  const handleModeChange = async (mode: "restricted" | "all") => {
    await updateSettings({ mode });
  };

  /**
   * 添加时间段
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证时间格式
    if (!validateTimeLockPeriod(formData.startTime, formData.endTime)) {
      alert("请输入有效的时间格式（HH:mm）");
      return;
    }

    try {
      await addPeriod({
        startTime: formData.startTime,
        endTime: formData.endTime,
        label: formData.label || `${formData.startTime} - ${formData.endTime}`,
        enabled: true,
      });

      setShowForm(false);
      setFormData({
        startTime: "22:00",
        endTime: "06:00",
        label: "",
      });
    } catch (error) {
      console.error("[TimeLockTab] 添加失败:", error);
      alert("添加失败，请重试");
    }
  };

  /**
   * 删除时间段
   */
  const handleDelete = async (id: string, label: string) => {
    if (confirm(`确定要删除"${label}"吗？`)) {
      try {
        await deletePeriod(id);
      } catch (error) {
        console.error("[TimeLockTab] 删除失败:", error);
        alert("删除失败，请重试");
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* 头部 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">固定时间限制</h2>
          <p className="text-gray-600 mt-1">设置特定时间段完全禁止访问</p>
        </div>

        {/* 总开关 */}
        <div className="mb-6 p-6 bg-purple-50 border border-purple-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">启用固定时间限制</h3>
                <p className="text-sm text-gray-600">在指定时间段内限制网站访问</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={handleToggleEnabled}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>

        {/* 限制模式选择 */}
        {settings.enabled && (
          <div className="mb-6 p-6 bg-white border border-gray-200 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-4">限制模式</h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50">
                <input
                  type="radio"
                  name="mode"
                  value="restricted"
                  checked={settings.mode === "restricted"}
                  onChange={() => handleModeChange("restricted")}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900">仅限制清单内网站</div>
                  <div className="text-sm text-gray-600">
                    只对"使用限制"中添加的网站生效
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50">
                <input
                  type="radio"
                  name="mode"
                  value="all"
                  checked={settings.mode === "all"}
                  onChange={() => handleModeChange("all")}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900">限制所有HTTP/HTTPS网站</div>
                  <div className="text-sm text-gray-600">
                    锁定时间段内无法访问任何网站（除chrome://等系统页面）
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* 添加时间段按钮 */}
        {settings.enabled && (
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              添加时间段
            </button>
          </div>
        )}

        {/* 添加表单 */}
        {showForm && (
          <div className="mb-6 p-6 bg-purple-50 border border-purple-200 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">添加时间段</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    开始时间 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    结束时间 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签（可选）
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="例如: 睡眠时间"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 提示：支持跨午夜时间段（例如: 22:00 - 06:00）
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  添加
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 时间段列表 */}
        {settings.enabled && settings.periods.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">已添加的时间段</h3>
            {settings.periods.map((period) => (
              <div
                key={period.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Moon className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {period.label || "未命名时间段"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatTimeLockPeriod(period)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(period.id, period.label || "该时间段")}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 空状态 */}
        {settings.enabled && settings.periods.length === 0 && !showForm && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <Moon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">还没有添加任何时间段</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              添加第一个时间段
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

