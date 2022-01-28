import { ChakraProvider } from "@chakra-ui/react";
import React from "react";
import { RecoilRoot } from "recoil";
import AppContext from "~/AppContext";
import { Configuration } from "~/configuration";
import { useExtStorage } from "~/util";

const AppWrapper = (props: { children: React.ReactNode }) => {
  const [config, setConfig] = useExtStorage<Configuration>("tracker-config");
  return (
    <ChakraProvider>
      <RecoilRoot>
        <AppContext.Provider value={{ config, setConfig }}>
          <div className="app">{props.children}</div>
        </AppContext.Provider>
      </RecoilRoot>
    </ChakraProvider>
  );
};

export default AppWrapper;
