import { Configuration } from "~/configuration";
import { createContext } from "react";

export interface IAppContext {
  config: Configuration;
  setConfig: (s: Configuration) => void;
}
export const AppContext = createContext<IAppContext>({} as any);
export default AppContext;
