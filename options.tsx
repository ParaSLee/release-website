/**
 * Options页面 - 主入口
 * 包含侧边栏导航和4个Tab管理界面
 */

import { useState } from "react";

import { Sidebar, type TabType } from "~components/options/Sidebar";
import { WebsitesTab } from "~components/options/WebsitesTab";
import { TimeLockTab } from "~components/options/TimeLockTab";
import { ResetTab } from "~components/options/ResetTab";
import { DataTab } from "~components/options/DataTab";

import "~styles/global.css";

function OptionsIndex() {
  const [activeTab, setActiveTab] = useState<TabType>("websites");

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 内容区 */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "websites" && <WebsitesTab />}
        {activeTab === "timelock" && <TimeLockTab />}
        {activeTab === "reset" && <ResetTab />}
        {activeTab === "data" && <DataTab />}
      </div>
    </div>
  );
}

export default OptionsIndex;

