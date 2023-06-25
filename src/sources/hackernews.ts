import log from "loglevel";
import { Comments, CommentsSource } from "./types";

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

export class HackerNewsSource implements CommentsSource {
  commentUrlFor(hit: Hit) {
    return `https://news.ycombinator.com/item?id=${hit.objectID}`;
  }

  async getCommentsFor(url: string) {
    log.debug(`[hn] Loading comments for ${url}`);
    return new Promise<Comments[]>((resolve) => {
      chrome.runtime.sendMessage(
        `http://hn.algolia.com/api/v1/search_by_date?query=${url}`,
        (data: Resp) => {
          log.debug(`[hn] Got this data: ${JSON.stringify(data)}`);
          const comments: Comments[] = data.hits.map((hit: Hit) => {
            return {
              url: this.commentUrlFor(hit),
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