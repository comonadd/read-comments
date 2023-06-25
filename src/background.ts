import { DEFAULT_CONFIG } from "./constants";
import { Configuration } from "~/configuration";
import extAPI from "./extAPI";

const CONFIG_STORE_NAME = "rc-config";

interface TrackerState {
  config: Configuration;
}

const state: TrackerState = {
  config: null,
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
};

void setup();

chrome.runtime.onMessage.addListener(function (url, sender, onSuccess) {
  void fetch(url, {
    mode: "cors",
  })
    .then((response) => response.json())
    .then((responseText) => onSuccess(responseText));
  return true;
});
