import log from "loglevel";
import { Comments, CommentsSource } from "./types";

type RedditCursor = string | null;

interface RedditChildData {
  title: string;
  ups: number;
  downs: number;
  score: number;
  thumbnail: string;
  author: string;
  permalink: string;
}

interface RedditDataChild {
  data: RedditChildData;
  kind: string;
}

interface RedditResponse {
  data: {
    after: RedditCursor;
    dist: number;
    modhash: string;
    geo_filter: string;
    children: RedditDataChild[];
  };
}

export class RedditSource implements CommentsSource {
  redditPermalinkToAbsolute(permalink: string)  {
    return `https://reddit.com${permalink}`;
  }

  async getCommentsFor(url: string) {
    log.debug(`[reddit] loading comments for ${url}`);
    return new Promise<Comments[]>((resolve) => {
      chrome.runtime.sendMessage(
        `http://www.reddit.com/search.json?q=${url}`,
        (data: RedditResponse) => {
          if (!data || !data.data || !data.data.children) {
            log.debug(`[reddit] No data for ${url}`);
            resolve([]);
            return;
          }
          log.debug(`Got data from Reddit source: ${JSON.stringify(data)}`);
          const comments: Comments[] = data.data.children.map((child) => {
            const item = child.data;
            return {
              url: this.redditPermalinkToAbsolute(item.permalink),
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