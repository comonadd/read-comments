import { DEFAULT_CONFIG } from "./constants";
import { Configuration } from "~/configuration";
import extAPI from "./extAPI";
import { getCommentsForUrl } from "./sources";

const CONFIG_STORE_NAME = "rc-config";

interface TrackerState {
  config: Configuration;
}

const state: TrackerState = {
  config: null,
};

const hostnames = new Set(["nytimes.com"]);

const shouldIgnoreUrl = (url: string) => {
  if (!hostnames.has(url)) {
    return true;
  }
  return false;
};

const trackUrl = async (url: string) => {
  if (shouldIgnoreUrl(url)) return;
  const comments = getCommentsForUrl(url);
  console.log(`these are the comments for ${url}`);
  console.log(comments);
};

const subcribeToExtStorageChangesOf = <T>(
  key: string,
  listener: (c: T) => void
) => {
  chrome.storage.onChanged.addListener((changes, area) => {
    const newValue = (changes[key] as any)?.newValue;
    if (area === "sync" && newValue) {
      listener(newValue);
    }
  });
};

const tabListener = (tabId: number, changeInfo: { url: string }, tab: any) => {
  if (changeInfo.url) {
    trackUrl(changeInfo.url);
  }
};

const setup = async () => {
  extAPI.storage.sync.get(CONFIG_STORE_NAME, (storageData) => {
    let config = storageData[CONFIG_STORE_NAME];
    if (!config) {
      extAPI.storage.sync.set({ CONFIG_STORE_NAME: DEFAULT_CONFIG });
      config = DEFAULT_CONFIG;
    }
    state.config = config;
  });
  subcribeToExtStorageChangesOf<Configuration>(CONFIG_STORE_NAME, (config) => {
    state.config = config;
  });
  extAPI.tabs.onUpdated.addListener(tabListener);
};

setup();

chrome.runtime.onMessage.addListener(function (url, sender, onSuccess) {
  fetch(url, {
    mode: "cors",
  })
    .then((response) => response.json())
    .then((responseText) => onSuccess(responseText));
  return true;
});
