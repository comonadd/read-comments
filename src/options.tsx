import React from "react";
import ReactDOM from "react-dom";
import Page from "./components/Page";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Heading } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import AppWrapper from "./components/AppWrapper";

const OptionsPage = () => {
  return (
    <AppWrapper>
      <Page title="Options">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="/options">Options</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        <Heading as="h3">Options</Heading>
        <Box>This is the options page</Box>
      </Page>
    </AppWrapper>
  );
};

const rootElem = document.querySelector("#root");
ReactDOM.render(<OptionsPage />, rootElem);
