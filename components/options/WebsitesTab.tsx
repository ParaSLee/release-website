/**
 * 使用限制Tab - 管理网站清单
 */

import { useEffect, useState } from "react";

import { Edit2, Globe, Plus, RefreshCw, Trash2 } from "lucide-react";

import { useWebsites } from "~hooks/useWebsites";
import type { WebsiteConfig } from "~types";
import { formatDuration } from "~utils/time";
import { getFaviconUrl, isValidDomain, normalizeDomain } from "~utils/domain";

export const WebsitesTab: React.FC = () => {
  const { websites, addWebsite, updateWebsite, deleteWebsite, toggleWebsite } = useWebsites();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    domain: "",
    displayName: "",
    dailyLimit: 3600, // 默认1小时
  });

  /**
   * 打开添加表单
   */
  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      domain: "",
      displayName: "",
      dailyLimit: 3600,
    });
    setShowForm(true);
  };

  /**
   * 打开编辑表单
   */
  const handleEdit = (website: WebsiteConfig) => {
    setEditingId(website.id);
    setFormData({
      domain: website.domain,
      displayName: website.displayName,
      dailyLimit: website.dailyLimit,
    });
    setShowForm(true);
  };

  /**
   * 提交表单
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证域名
    if (!isValidDomain(formData.domain)) {
      alert("请输入有效的域名（例如：youtube.com）");
      return;
    }

    // 规范化域名
    const normalizedDomain = normalizeDomain(formData.domain);

    // 检查重复
    if (!editingId) {
      const exists = websites.some((w) => w.domain === normalizedDomain);
      if (exists) {
        alert("该域名已存在");
        return;
      }
    }

    try {
      if (editingId) {
        // 更新
        await updateWebsite(editingId, {
          domain: normalizedDomain,
          displayName: formData.displayName || formData.domain,
          dailyLimit: formData.dailyLimit,
        });
      } else {
        // 添加
        await addWebsite({
          domain: normalizedDomain,
          displayName: formData.displayName || formData.domain,
          dailyLimit: formData.dailyLimit,
          enabled: true,
          icon: getFaviconUrl(normalizedDomain),
        });
      }

      setShowForm(false);
    } catch (error) {
      console.error("[WebsitesTab] 保存失败:", error);
      alert("保存失败，请重试");
    }
  };

  /**
   * 删除网站
   */
  const handleDelete = async (id: string, displayName: string) => {
    if (confirm(`确定要删除"${displayName}"吗？`)) {
      try {
        await deleteWebsite(id);
      } catch (error) {
        console.error("[WebsitesTab] 删除失败:", error);
        alert("删除失败，请重试");
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">使用限制</h2>
            <p className="text-gray-600 mt-1">管理受限网站清单，设置每日使用时间</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            添加网站
          </button>
        </div>

        {/* 添加/编辑表单 */}
        {showForm && (
          <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? "编辑网站" : "添加网站"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  域名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="例如: youtube.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  仅输入域名，不需要 www 或 https://
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  显示名称
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="例如: YouTube"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  留空将自动使用域名
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  每日限制时间（秒） <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.dailyLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, dailyLimit: parseInt(e.target.value) || 0 })
                  }
                  min="10"
                  step="1"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                  <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                    {formatDuration(formData.dailyLimit)}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, dailyLimit: 20 })}
                    className="text-xs px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    20秒(测试)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, dailyLimit: 60 })}
                    className="text-xs px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    1分钟
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, dailyLimit: 1800 })}
                    className="text-xs px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    30分钟
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, dailyLimit: 3600 })}
                    className="text-xs px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    1小时
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingId ? "保存" : "添加"}
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

        {/* 网站列表 */}
        {websites.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">还没有添加任何网站</p>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              添加第一个网站
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {websites.map((website) => (
              <div
                key={website.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  {/* 图标和信息 */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {website.icon ? (
                      <img
                        src={website.icon}
                        alt={website.displayName}
                        className="w-10 h-10 rounded-lg"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                        <span className="text-white font-bold">
                          {website.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{website.displayName}</h3>
                      <p className="text-sm text-gray-500 truncate">{website.domain}</p>
                    </div>
                  </div>

                  {/* 限制时间 */}
                  <div className="text-right">
                    <div className="text-sm text-gray-600">每日限制</div>
                    <div className="font-semibold text-blue-600">
                      {formatDuration(website.dailyLimit)}
                    </div>
                  </div>

                  {/* 启用开关 */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={website.enabled}
                      onChange={() => toggleWebsite(website.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(website)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(website.id, website.displayName)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

