import { useContext } from "react";
import { DEFAULT_CONFIG } from "~/constants";
import AppContext from "~/AppContext";
export { DEFAULT_CONFIG } from "~/constants";

export const enum Source {
  Hackernews = "hackernews",
}

export type Configuration = {
  // Sites to check for comments
  configuredSources: Source[];
};

export const useAppConfigPart = <K extends keyof CC, CC = Configuration>(part: K): CC[K] => {
  const { config } = useContext(AppContext);
  const value = (config as any)[part] ?? (DEFAULT_CONFIG as any)[part];
  return value;
};
