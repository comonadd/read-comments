import log from "loglevel";
import { AtomEffect } from "recoil";

export interface PersistStorage {
  setItem(key: string, value: string): void | Promise<void>;
  mergeItem?(key: string, value: string): Promise<void>;
  getItem(key: string): null | string | Promise<string>;
}

export interface PersistConfiguration {
  key?: string;
  storage?: PersistStorage;
  expiresAfter?: number;
}

const exp_table_key = "__recoil-exp-table";

export const recoilPersist = (
  config: PersistConfiguration = {}
): { persistAtom: AtomEffect<any> } => {
  if (typeof window === "undefined") {
    return {
      persistAtom: () => {},
    };
  }

  const storage = {
    getItem: async (key: string) => {
      return new Promise((resolve) => {
        chrome.storage.sync.get(key, (data) => {
          resolve(data);
        });
      });
    },
    setItem: async (key: string, value: string) => {
      return new Promise<void>((resolve) => {
        chrome.storage.sync.set({ [key]: value }, () => {
          resolve();
        });
      });
    },
  };
  const { key = "recoil-persist" } = config;

  type ExpTable = Record<string, number>;
  const getExpTable = (): ExpTable => {
    const expTableJSON: string | null = localStorage.getItem(exp_table_key);
    let expTable: ExpTable | null =
      expTableJSON !== null ? JSON.parse(expTableJSON) : null;
    if (expTable === null) {
      expTable = {};
    }
    return expTable;
  };

  const persistAtom: AtomEffect<any> = ({ onSet, node, trigger, setSelf }) => {
    if (trigger === "get") {
      const state = getState();
      // const expTable = getExpTable();
      // const isExpirationDateDefined = config.expiresAfter && expTable[node.key];
      // if (isExpirationDateDefined) {
      //   const expDate = expTable[node.key] + config.expiresAfter;
      //   const now = Date.now();
      //   if (expDate > now) {
      //     log.debug(
      //       `key ${node.key} has expired, will not get value (${expDate}, ${now}))`
      //     );
      //     return null;
      //   }
      // }
      if (typeof state.then === "function") {
        state.then((s: any) => {
          if (s.hasOwnProperty(node.key)) {
            setSelf(s[node.key]);
          }
        });
      }
      if (state.hasOwnProperty(node.key)) {
        setSelf(state[node.key]);
      }
    }

    onSet(async (newValue, _, isReset) => {
      const state = getState();
      const expTable = getExpTable();
      if (typeof state.then === "function") {
        state.then((s: any) => updateState(newValue, s, node.key, isReset));
      } else {
        updateState(newValue, state, node.key, isReset);
      }
      // update expiration timings
      const now = Date.now();
      log.debug(
        `updating expiration timings for ${exp_table_key} -> ${node.key}: ${now}`
      );
      localStorage.setItem(
        exp_table_key,
        JSON.stringify({ ...expTable, [node.key]: now })
      );
    });
  };

  const updateState = (
    newValue: any,
    state: any,
    key: string,
    isReset: boolean
  ) => {
    if (isReset) {
      delete state[key];
    } else {
      state[key] = newValue;
    }

    setState(state);
  };

  const getState = (): any => {
    const toParse = storage.getItem(key);
    if (toParse === null || toParse === undefined) {
      return {};
    }
    if (typeof toParse === "string") {
      return parseState(toParse);
    }
    if (typeof toParse.then === "function") {
      return toParse.then(parseState);
    }

    return {};
  };

  const parseState = (state: string) => {
    if (state === undefined) {
      return {};
    }
    try {
      return JSON.parse(state);
    } catch (e) {
      console.error(e);
      return {};
    }
  };

  const setState = (state: any): void => {
    try {
      storage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error(e);
    }
  };

  return { persistAtom };
};
