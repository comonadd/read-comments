import { DEFAULT_CONFIG, Source } from "~/configuration";
import log from "loglevel";
import { HackerNewsSource } from "./hackernews";
import { Comments, CommentsSource } from "./types";
import { RedditSource } from "./reddit";

const sourceHandlers = {
  [Source.Hackernews]: new HackerNewsSource(),
  [Source.Reddit]: new RedditSource(),
};

const getSourceHandlerForSourceId = (id: Source): CommentsSource => {
  return sourceHandlers[id];
};

export type LoadedComments = Record<Source, Comments[]>;

export const getCommentsForUrl = async (url: string) => {
  const config = DEFAULT_CONFIG;
  const comments: LoadedComments = {} as any;
  log.debug(`Loading comments for ${url}`);
  log.debug(`Configured sources: ${config.configuredSources}`);
  for (const sourceId of config.configuredSources) {
    const sh = getSourceHandlerForSourceId(sourceId);
    const c = await sh.getCommentsFor(url);
    comments[sourceId] = c;
  }
  return comments;
};

log.setLevel("debug");
