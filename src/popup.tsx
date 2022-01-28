import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Center, Heading, Icon, Link } from "@chakra-ui/react";
import { Text, Box } from "@chakra-ui/react";
import AppWrapper from "./components/AppWrapper";
import { Spinner } from "@chakra-ui/react";
import { Comments, getCommentsForUrl, LoadedComments } from "./sources";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { UpDownIcon } from "@chakra-ui/icons";
import { Source } from "./configuration";
import { FaHackerNews } from "react-icons/fa";
import { atom, atomFamily, useRecoilState } from "recoil";
import { recoilPersist } from "./recoilPersist";

const useCurrentTab = () => {
  const [tab, setTab] = useState(null);
  var query = { active: true, currentWindow: true };
  useEffect(() => {
    function callback(tabs: any) {
      const currentTab = tabs[0]; // there will be only one in this array
      setTab(currentTab);
    }
    chrome.tabs.query(query, callback);
  }, []);
  return tab;
};

const minutes = (n: number) => n * 60 * 60;

const { persistAtom } = recoilPersist({ expiresAfter: minutes(10) });

const pagesState = atom({
  key: "pagesState",
  default: {},
  // effects_UNSTABLE: [persistAtom],
});

type LoadedPages = Record<string, LoadedComments>;

const useCommentsForCurrentPage = () => {
  const [loadedPages, setLoadedPages] = useRecoilState<LoadedPages>(pagesState);
  const tab = useCurrentTab();
  const [loading, setLoading] = useState<boolean>(false);
  const [comments, setComments] = useState<LoadedComments>({} as any);
  useEffect(() => {
    if (tab === null) return;
    if (loadedPages[tab.url] !== undefined) {
      console.log(loadedPages);
      setComments(loadedPages[tab.url]);
    }
    (async () => {
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

const sourceToIcon = {
  [Source.Hackernews]: FaHackerNews,
};

const renderIconForSource = (source: Source) => {
  const icon = sourceToIcon[source];
  if (!icon) {
    return null;
  }
  return <Icon as={icon} />;
};

const CommentsDisplay = (props: { comments: LoadedComments }) => {
  return (
    <Box>
      <Accordion defaultIndex={[0]} allowMultiple>
        {Array.from(Object.entries(props.comments)).map(
          ([source, comments]) => {
            return (
              <AccordionItem>
                <AccordionButton>
                  <Box
                    flex="1"
                    textAlign="left"
                    display="flex"
                    alignItems="center"
                  >
                    {renderIconForSource(source as Source)}
                    <Text ml="2">{source}</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  {comments.map((comment) => {
                    return (
                      <Box width="100%" mb="2" display="flex">
                        <Box
                          display="flex"
                          flexDir="column"
                          alignItems="center"
                          justifyContent="center"
                          width="2rem"
                        >
                          <UpDownIcon />
                          <Text>{comment.points}</Text>
                        </Box>
                        <Link href={comment.url} isExternal>
                          {comment.title}
                        </Link>
                      </Box>
                    );
                  })}
                </AccordionPanel>
              </AccordionItem>
            );
          }
        )}
      </Accordion>
    </Box>
  );
};

const Popup = () => {
  const { comments, loading } = useCommentsForCurrentPage();
  return (
    <Box
      padding="4"
      style={{ width: 500, height: 400 }}
      bg="white"
      color="black"
    >
      <Heading pb="2" as="h1" size="md">
        Comments for this page
      </Heading>
      {loading ? (
        <Center h="100%">
          <Spinner size="lg" />
        </Center>
      ) : (
        <CommentsDisplay comments={comments} />
      )}
    </Box>
  );
};

const rootElem = document.querySelector("#root");
ReactDOM.render(
  <AppWrapper>
    <Popup />
  </AppWrapper>,
  rootElem
);
