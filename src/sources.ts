import { DEFAULT_CONFIG, Source } from "~/configuration";
import axios from "axios";
import extAPI from "./extAPI";
import log from "loglevel";

export interface Comments {
  title: string;
  points: number;
  url: string;
  num_comments: number;
}

interface CommentsSource {
  getCommentsFor: (url: string) => Promise<Comments[]>;
}

class HackerNewsSource implements CommentsSource {
  async getCommentsFor(url: string) {
    log.debug(`[hn] loading comments for ${url}`);
    type Tag = "story" | "front_page";
    interface Hit {
      title: string;
      points: number;
      created_at: string;
      _tags: Tag[];
      objectID: string;
      num_comments: number;
    }
    interface Resp {
      hits: Hit[];
    }
    const urlFor = (hit: Hit) => {
      return `https://news.ycombinator.com/item?id=${hit.objectID}`;
    };
    return new Promise<Comments[]>((resolve) => {
      chrome.runtime.sendMessage(
        `http://hn.algolia.com/api/v1/search_by_date?query=${url}`,
        (data) => {
          const comments: Comments[] = data.hits.map((hit: Hit) => {
            return {
              url: urlFor(hit),
              title: hit.title,
              points: hit.points,
              num_comments: hit.num_comments,
            };
          });
          resolve(comments);
        }
      );
    });
  }
}

class RedditSource implements CommentsSource {
  async getCommentsFor(url: string) {
    log.debug(`[reddit] loading comments for ${url}`);
    type Tag = "story" | "front_page";
    interface Hit {
      title: string;
      points: number;
      created_at: string;
      _tags: Tag[];
      objectID: string;
      num_comments: number;
    }
    type Cursor = string | null;
    const permalinkToAbsolute = (permalink: string) => {
      return `https://reddit.com${permalink}`;
    };

    interface ChildData {
      title: string;
      ups: number;
      downs: number;
      score: number;
      thumbnail: string;
      author: string;
      permalink: string;
    }

    interface DataChild {
      data: ChildData;
      kind: string;
    }

    interface Resp {
      data: {
        after: Cursor;
        dist: number;
        modhash: string;
        geo_filter: string;
        children: DataChild[];
      };
    }
    return new Promise<Comments[]>((resolve) => {
      chrome.runtime.sendMessage(
        `http://www.reddit.com/search.json?q=${url}`,
        (data: Resp) => {
          log.debug(data);
          const comments: Comments[] = data.data.children.map((child) => {
            const item = child.data;
            return {
              url: permalinkToAbsolute(item.permalink),
              title: item.title,
              points: item.score,
              num_comments: 0,
            };
          });
          resolve(comments);
        }
      );
    });
  }
}

const sourceHandlers = {
  [Source.Hackernews]: new HackerNewsSource(),
  [Source.Reddit]: new RedditSource(),
};

const getSourceHandlerForSourceId = (id: Source): CommentsSource => {
  return sourceHandlers[id];
};

export type LoadedComments = Record<Source, Comments[]>;

interface CommentsSource {}

export const getCommentsForUrl = async (url: string) => {
  const config = DEFAULT_CONFIG;
  const comments: LoadedComments = {} as any;
  log.debug(`loading comments for ${url}`);
  for (let sourceId of config.configuredSources) {
    log.debug(sourceId);
    const sh = getSourceHandlerForSourceId(sourceId);
    const c = await sh.getCommentsFor(url);
    comments[sourceId] = c;
  }
  return comments;
};

log.setLevel("debug");
