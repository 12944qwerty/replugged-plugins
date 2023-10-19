import { common, components, webpack } from "replugged";
import { cfg } from ".";

import themes from "./themes.json";
import Codeblock from "./Codeblock";

const { React } = common;
const { SelectItem, ErrorBoundary } = components;

import previews from "./previews.json";

const classes = await webpack.waitForProps<Record<string, string>>("select", "lookFilled");

function updateTheme(theme: string) {
  cfg.set("theme", theme);

  const themeStylesheet = document.getElementById("hljs-theme") as HTMLLinkElement;
  if (themeStylesheet)
    themeStylesheet.href = `https://cdn.jsdelivr.net/gh/qwerty-mods/better-codeblocks@master/src/themes/${cfg.get(
      "theme",
    )}.min.css`;
}

export function Settings(): React.ReactElement {
  const [previewID, setPreviewID] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPreviewID((prevID) => (prevID + 1) % previews.length);
    }, 10e3);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <ErrorBoundary>
        <Codeblock lang={previews[previewID].lang} code={previews[previewID].code}></Codeblock>
      </ErrorBoundary>
      <br />
      <SelectItem
        options={themes.map((theme) => {
          return { label: theme, value: theme };
        })}
        onChange={updateTheme}
        isSelected={(theme) => theme === cfg.get("theme")}
        closeOnSelect={false}
        maxVisibleItems={8}
        onOpen={() => {
          setTimeout(() => {
            const selected = document
              .getElementsByClassName(classes.popout)[0]
              .getElementsByClassName(classes.selectedIcon)[0];
            selected.scrollIntoView(false);
          }, 75);
        }}>
        Preferred Theme
      </SelectItem>
    </>
  );
}
