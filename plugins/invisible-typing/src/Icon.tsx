import { common, components } from "replugged";

import { cfg } from ".";

const { React, channels } = common;
const { Clickable, Tooltip } = components;

export const Icon = (props: { type?: { analyticsName: string } }) => {
  const { type } = props;
  if (
    (type?.analyticsName !== "normal" && type?.analyticsName !== "sidebar") ||
    !cfg.get("button", true)
  ) {
    return null;
  }
  const channelId = channels.getCurrentlySelectedChannelId()!;
  const globalInvisible = cfg.get("invisible", true);
  const channelWise = cfg.get("button", true) ? cfg.get("channelWise", true) : false;
  const channelsList = cfg.get("channels", { [channelId]: globalInvisible });
  const [enabled, setEnabled] = React.useState(
    channelWise ? (channelsList[channelId] ?? globalInvisible) : globalInvisible,
  );
  return (
    <div key={`${enabled}`}>
      <Tooltip text={!enabled ? "Disable Typing" : "Enable Typing"}>
        <Clickable
          style={{ marginTop: 5 }}
          onClick={() => {
            if (channelWise) {
              channelsList[channelId] = !enabled;
              cfg.set("channels", channelsList);
            } else {
              cfg.set("invisible", !enabled);
            }
            setEnabled(!enabled);
          }}>
          <button className="invisible-typing-button">
            <svg width="25" height="25" viewBox="0 0 576 512">
              <path
                fill="currentColor"
                d="M528 448H48c-26.51 0-48-21.49-48-48V112c0-26.51 21.49-48 48-48h480c26.51 0 48 21.49 48 48v288c0 26.51-21.49 48-48 48zM128 180v-40c0-6.627-5.373-12-12-12H76c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h40c6.627 0 12-5.373 12-12zm96 0v-40c0-6.627-5.373-12-12-12h-40c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h40c6.627 0 12-5.373 12-12zm96 0v-40c0-6.627-5.373-12-12-12h-40c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h40c6.627 0 12-5.373 12-12zm96 0v-40c0-6.627-5.373-12-12-12h-40c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h40c6.627 0 12-5.373 12-12zm96 0v-40c0-6.627-5.373-12-12-12h-40c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h40c6.627 0 12-5.373 12-12zm-336 96v-40c0-6.627-5.373-12-12-12h-40c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h40c6.627 0 12-5.373 12-12zm96 0v-40c0-6.627-5.373-12-12-12h-40c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h40c6.627 0 12-5.373 12-12zm96 0v-40c0-6.627-5.373-12-12-12h-40c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h40c6.627 0 12-5.373 12-12zm96 0v-40c0-6.627-5.373-12-12-12h-40c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h40c6.627 0 12-5.373 12-12zm-336 96v-40c0-6.627-5.373-12-12-12H76c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h40c6.627 0 12-5.373 12-12zm288 0v-40c0-6.627-5.373-12-12-12H172c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h232c6.627 0 12-5.373 12-12zm96 0v-40c0-6.627-5.373-12-12-12h-40c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h40c6.627 0 12-5.373 12-12z"
              />
              <rect
                key={`${enabled}`}
                className={`disabled-stroke-through${!enabled ? " invistype-disabled" : ""}`}
                x="10"
                y="10"
                width="600pt"
                height="70px"
                fill="#f04747"
              />
            </svg>
          </button>
        </Clickable>
      </Tooltip>
    </div>
  );
};
