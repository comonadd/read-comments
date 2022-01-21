import React, { useContext, useMemo, useEffect, useState, useRef, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import { useExtStorage } from "./util";
import { DEFAULT_CONFIG, Configuration } from "~/configuration";
import AppContext from "./AppContext";

const OptionsPage = () => {
  const [config, setConfig] = useExtStorage<Configuration>("tracker-config");
  return (
    <AppContext.Provider value={{ config, setConfig }}>
      <div className="app">
        <Page title="Options" className="config-page">
          <BreadcrumbsForPath
            path={[
              {
                text: "Dashboard",
                path: paths.DASHBOARD_PAGE,
                external: true,
              },
              { text: "Options", path: "#", disabled: true },
            ]}
          />
          <Typography component="h1" variant="h4" className="mb-4">
            Options
          </Typography>
          <div className="lg-w-half w-full">
            <Typography component="p" color="textSecondary" className="fs-14">
              You can configure your activity matchers here. After saving, the records will be
              updated automatically. "activityTypes" defines the activity types and their value.
              "matcher" maps the website domain to a particular activity type.
            </Typography>
          </div>
          <ConfigEditor />
          <LogsDisplay />
        </Page>
      </div>
    </AppContext.Provider>
  );
};

const rootElem = document.querySelector("#root");
ReactDOM.render(<OptionsPage />, rootElem);
