import { DEFAULT_CONFIG, Source } from "~/configuration";
import axios from "axios";
import extAPI from "./extAPI";

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
    console.log("[hn] loading comments for", url);
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

const sourceHandlers = {
  [Source.Hackernews]: new HackerNewsSource(),
};

const getSourceHandlerForSourceId = (id: Source): CommentsSource => {
  return sourceHandlers[id];
};

export type LoadedComments = Record<Source, Comments[]>;

interface CommentsSource {}

export const getCommentsForUrl = async (url: string) => {
  console.log("loading comments for", url);
  // const config = state?.config ?? DEFAULT_CONFIG;
  const config = DEFAULT_CONFIG;
  const comments: LoadedComments = {} as any;
  for (let sourceId of config.configuredSources) {
    const sh = getSourceHandlerForSourceId(sourceId);
    const c = await sh.getCommentsFor(url);
    comments[sourceId] = c;
  }
  return comments;
};
