import { ActivityTypesMapping, ActivityMatcher, Configuration, Site } from "./configuration";
import manifest from "~/chrome-manifest.json";

export const APP_NAME = manifest.name;

export const TRACK_INFO_STORE_NAME = "tracking-info";
export const USER_LOG_STORE_NAME = "user-logs";
export const ACTIVITY_UNDEFINED = -1;

export const DEFAULT_CONFIG: Configuration = {
  sitesToCheck: [Site.Hackernews],
};
