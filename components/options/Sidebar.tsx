/**
 * Options页面侧边栏导航
 */

import { Clock, Database, Globe, Moon } from "lucide-react";

export type TabType = "websites" | "timelock" | "reset" | "data";

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: "websites" as TabType,
      label: "使用限制",
      icon: Globe,
      description: "管理网站清单",
    },
    {
      id: "timelock" as TabType,
      label: "固定时间限制",
      icon: Moon,
      description: "设置锁定时间段",
    },
    {
      id: "reset" as TabType,
      label: "重置配置",
      icon: Clock,
      description: "配置重置时间",
    },
    {
      id: "data" as TabType,
      label: "数据管理",
      icon: Database,
      description: "导入/导出数据",
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo区域 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Website Block</h1>
            <p className="text-xs text-gray-500">插件设置</p>
          </div>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 p-4 space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
              <div className="flex-1 text-left">
                <div className={`font-semibold ${isActive ? "text-blue-600" : "text-gray-900"}`}>
                  {tab.label}
                </div>
                <div className="text-xs text-gray-500">{tab.description}</div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* 版本信息 */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">Version 1.0.0</p>
      </div>
    </div>
  );
};

