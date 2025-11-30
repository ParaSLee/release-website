import { useCallback, useEffect, useState } from "react";

/**
 * Chrome 存储操作的自定义 Hook
 * 提供对 chrome.storage.local 的响应式访问，支持自动更新
 */
export function useStorage<T>(key: string, defaultValue?: T) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 加载初始数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await chrome.storage.local.get(key);
        setData(result[key] ?? defaultValue ?? null);
        setError(null);
      } catch (err) {
        console.error(`[存储] 加载存储键"${key}"时出错:`, err);
        setError(err instanceof Error ? err : new Error("未知错误"));
        setData(defaultValue ?? null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key, defaultValue]);

  // 监听存储变化
  useEffect(() => {
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === "local" && changes[key]) {
        setData(changes[key].newValue ?? defaultValue ?? null);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [key, defaultValue]);

  // 更新存储中的数据
  const update = useCallback(
    async (newData: T) => {
      try {
        await chrome.storage.local.set({ [key]: newData });
        setData(newData);
        setError(null);
      } catch (err) {
        console.error(`[存储] 更新存储键"${key}"时出错:`, err);
        setError(err instanceof Error ? err : new Error("未知错误"));
        throw err;
      }
    },
    [key]
  );

  // 手动刷新数据
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const result = await chrome.storage.local.get(key);
      setData(result[key] ?? defaultValue ?? null);
      setError(null);
    } catch (err) {
      console.error(`[存储] 刷新存储键"${key}"时出错:`, err);
      setError(err instanceof Error ? err : new Error("未知错误"));
    } finally {
      setLoading(false);
    }
  }, [key, defaultValue]);

  return { data, loading, error, update, refresh };
}

/**
 * 从存储中获取数据的工具函数（非响应式）
 */
export async function getStorageData<T>(key: string, defaultValue?: T): Promise<T> {
  const result = await chrome.storage.local.get(key);
  return result[key] ?? defaultValue;
}

/**
 * 设置存储数据的工具函数
 */
export async function setStorageData<T>(key: string, value: T): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

/**
 * 从存储中删除数据的工具函数
 */
export async function removeStorageData(key: string): Promise<void> {
  await chrome.storage.local.remove(key);
}

/**
 * 清空所有存储数据的工具函数
 */
export async function clearAllStorage(): Promise<void> {
  await chrome.storage.local.clear();
}

