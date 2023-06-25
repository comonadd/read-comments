import { useEffect, useState } from "react";
import extAPI from "./extAPI";

export enum LStatus {
  Loading = 0,
  Loaded = 1,
  Errored = 2,
}

// TODO: Implement automatic sync
export function useExtStorage<T>(key: string): [T, (v: T) => void, LStatus] {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<LStatus>(LStatus.Loading);
  useEffect(() => {
    extAPI.storage.sync.get(key, (storageData: any) => {
      if (storageData) {
        setData(storageData[key] as any as T);
      } else {
        setData(null);
      }
      setStatus(LStatus.Loaded);
    });
  }, [key]);
  const setNewValue = (newValue: T) => {
    extAPI.storage.sync.set({ [key]: newValue });
    setData(newValue);
  };
  return [data, setNewValue, status];
}

export const minutes = (n: number) => n * 60 * 60;