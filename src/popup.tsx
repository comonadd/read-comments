import React from "react";
import ReactDOM from "react-dom";
import { Center, Heading, Icon, Link } from "@chakra-ui/react";
import { Text, Box } from "@chakra-ui/react";
import AppWrapper from "./components/AppWrapper";
import { Spinner } from "@chakra-ui/react";
import { LoadedComments } from "./sources";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { UpDownIcon } from "@chakra-ui/icons";
import { Source } from "./configuration";
import { FaHackerNews, FaReddit } from "react-icons/fa";
import range from "lodash/range";
import { sortBy } from "lodash";
import { Comments } from "./sources/types";
import { useCommentsForCurrentPage } from "./hooks";

const sourceToIcon = {
  [Source.Hackernews]: FaHackerNews,
  [Source.Reddit]: FaReddit,
};

const renderIconForSource  = (source: Source) => {
  const icon = sourceToIcon[source];
  if (!icon) {
    return null;
  }
  return <Icon as={icon} />;
};

const CommentsAccordion = (props: { source: string; comments: Comments[] }) => {
  const { source, comments } = props;
  const commentsSorted = sortBy(comments, "points");
  return (
    <AccordionItem key={source}>
      <AccordionButton>
        <Box flex="1" textAlign="left" display="flex" alignItems="center">
          {renderIconForSource(source as Source)}
          <Text ml="2">{source}</Text>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        {commentsSorted.map((comment) => {
          return (
            <Box width="100%" mb="2" display="flex" key={comment.url}>
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
};

const CommentsDisplay = (props: { comments: LoadedComments }) => {
  const e = Array.from(Object.entries(props.comments));
  return (
    <Box>
      <Accordion defaultIndex={range(e.length)} allowMultiple>
        {e.map(([source, comments]) => {
          return <CommentsAccordion source={source} comments={comments} />;
        })}
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
