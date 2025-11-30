import { useCallback } from "react";

import type { UseWebsitesReturn, WebsiteConfig } from "~types";

import { STORAGE_KEYS } from "../types";
import { generateUUID } from "../utils/helpers";
import { useStorage } from "./useStorage";

/**
 * 管理网站配置的自定义 Hook
 */
export function useWebsites(): UseWebsitesReturn {
  const { data: websites, loading, update } = useStorage<WebsiteConfig[]>(
    STORAGE_KEYS.WEBSITES,
    []
  );

  // 添加新网站
  const addWebsite = useCallback(
    async (config: Omit<WebsiteConfig, "id" | "createdAt">) => {
      const newWebsite: WebsiteConfig = {
        ...config,
        id: generateUUID(),
        createdAt: Date.now(),
      };

      const updatedWebsites = [...(websites || []), newWebsite];
      await update(updatedWebsites);
    },
    [websites, update]
  );

  // 更新已存在的网站
  const updateWebsite = useCallback(
    async (id: string, updates: Partial<WebsiteConfig>) => {
      const updatedWebsites = (websites || []).map((website) =>
        website.id === id ? { ...website, ...updates } : website
      );
      await update(updatedWebsites);
    },
    [websites, update]
  );

  // 删除网站
  const deleteWebsite = useCallback(
    async (id: string) => {
      const updatedWebsites = (websites || []).filter((website) => website.id !== id);
      await update(updatedWebsites);
    },
    [websites, update]
  );

  // 切换网站启用状态
  const toggleWebsite = useCallback(
    async (id: string) => {
      const updatedWebsites = (websites || []).map((website) =>
        website.id === id ? { ...website, enabled: !website.enabled } : website
      );
      await update(updatedWebsites);
    },
    [websites, update]
  );

  // 根据域名获取网站
  const getWebsite = useCallback(
    (domain: string) => {
      return (websites || []).find((website) => website.domain === domain);
    },
    [websites]
  );

  return {
    websites: websites || [],
    loading,
    addWebsite,
    updateWebsite,
    deleteWebsite,
    toggleWebsite,
    getWebsite,
  };
}

