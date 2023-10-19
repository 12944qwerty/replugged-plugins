import { Injector, common, components, settings } from "replugged";
import Codeblock from "./Codeblock";

const { parser, React } = common;
const { ErrorBoundary } = components;

import "./index.css";

export { Settings } from "./Settings";

const injector = new Injector();

export interface SettingsType {
  theme: string;
}
export const cfg = await settings.init<SettingsType>("dev.kingfish.BetterCodeblocks", {
  theme: "vs2015",
});

export function start(): void {
  const themeStylesheet = document.createElement("link");
  themeStylesheet.rel = "stylesheet";
  themeStylesheet.id = "hljs-theme";
  themeStylesheet.href = `https://cdn.jsdelivr.net/gh/qwerty-mods/better-codeblocks@master/src/themes/${cfg.get(
    "theme",
  )}.min.css`;
  document.head.appendChild(themeStylesheet);

  injector.after(parser.defaultRules.codeBlock, "react", (args, _) => {
    const { lang, content: code } = args[0] as { lang: string; content: string };

    return React.createElement(
      ErrorBoundary,
      {},
      React.createElement(Codeblock, {
        lang,
        code,
      }),
    );
  });
}

export function stop(): void {
  document.getElementById("hljs-theme")?.remove();

  injector.uninjectAll();
}
