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

  const { key = "recoil-persist", storage = localStorage } = config;

  const persistAtom: AtomEffect<any> = ({ onSet, node, trigger, setSelf }) => {
    if (trigger === "get") {
      const state = getState();
      const expTable: any = localStorage.getItem(exp_table_key);
      const isExpired =
        config.expiresAfter &&
        expTable[node.key] &&
        expTable[node.key] + config.expiresAfter > Date.now();
      if (isExpired) {
        console.log(`key ${node.key} has expired, will not get value`);
        return null;
      }
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
      const expTable: any = localStorage.getItem(exp_table_key);
      if (typeof state.then === "function") {
        state.then((s: any) => updateState(newValue, s, node.key, isReset));
        localStorage.setItem(exp_table_key, JSON.stringify(expTable));
      } else {
        updateState(newValue, state, node.key, isReset);
      }
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
      if (typeof storage.mergeItem === "function") {
        storage.mergeItem(key, JSON.stringify(state));
      } else {
        storage.setItem(key, JSON.stringify(state));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return { persistAtom };
};
