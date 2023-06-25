import { useEffect, useState } from "react";
import { getCommentsForUrl, LoadedComments } from "./sources";
import { atom, useRecoilState } from "recoil";
import { recoilPersist } from "./recoilPersist";
import log from "loglevel";
import { minutes } from "./util";

const useCurrentTab = () => {
  const [tab, setTab] = useState(null);
  const query = { active: true, currentWindow: true };
  useEffect(() => {
    function callback(tabs: any) {
      const currentTab = tabs[0]; // there will be only one in this array
      setTab(currentTab);
    }
    chrome.tabs.query(query, callback);
  }, []);
  return tab;
};

const { persistAtom } = recoilPersist({ expiresAfter: minutes(10) });

const pagesState = atom({
  key: "pagesState",
  default: {},
  effects_UNSTABLE: [persistAtom],
});

type LoadedPages = Record<string, LoadedComments>;

export const useCommentsForCurrentPage = () => {
  const [loadedPages, setLoadedPages] = useRecoilState<LoadedPages>(pagesState);
  const tab = useCurrentTab();
  const [loading, setLoading] = useState<boolean>(false);
  const [comments, setComments] = useState<LoadedComments>({} as any);
  useEffect(() => {
    log.debug("these are saved things");
    log.debug(loadedPages);
    if (tab === null) return;
    if (loadedPages && loadedPages[tab.url] !== undefined) {
      log.debug(`saved, loading from local storage: ${tab.url}`);
      log.debug(loadedPages[tab.url]);
      setComments(loadedPages[tab.url]);
    }
    void (async () => {
      setLoading(true);
      const c = await getCommentsForUrl(tab.url);
      setComments(c);
      setLoadedPages({ ...loadedPages, [tab.url]: c });
      setLoading(false);
    })();
  }, [tab]);
  return {
    comments,
    loading,
  };
};