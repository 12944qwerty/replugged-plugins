import { Injector, Logger, common, settings, webpack } from "replugged";
import "./style.css";

import { Icon } from "./Icon";
export { Settings } from "./Settings";

const inject = new Injector();
const logger = Logger.plugin("InvisibleTyping");

const { React, typing } = common;

export interface SettingsType {
  button?: boolean;
  invisible?: boolean;
  channelWise?: boolean;
  channels?: Record<string, boolean | undefined>;
}
export const cfg = await settings.init<SettingsType>("dev.kingfish.InvisibleTyping");

export async function start(): Promise<void> {
  inject.instead(typing, "startTyping", ([channelId], original) => {
    const globalInvisible = cfg.get("invisible", true);
    const channelWise = cfg.get("button", true) ? cfg.get("channelWise", true) : false;
    const channels = cfg.get("channels", { [channelId]: globalInvisible });
    if (channelWise ? (channels[channelId] ?? globalInvisible) : globalInvisible) {
      return null;
    } else {
      original(channelId);
    }
  });

  const channelTextAreaButtonsMod = await webpack.waitForModule(
    webpack.filters.bySource(/{disabled:\w+,type:\w+},"emoji"/),
  );
  const ChannelTextAreaButtons = webpack.getExportsForProps<{
    type: (args: { type: { analyticsName: string } }) => React.ReactElement | null;
  }>(channelTextAreaButtonsMod, ["type"]);

  if (!ChannelTextAreaButtons) {
    logger.error("Couldn't find ChannelTextAreaButtons");
    return;
  }

  inject.after(ChannelTextAreaButtons, "type", ([args], res) => {
    if (res) {
      res.props.children.splice(1, 0, React.createElement(Icon, { type: args.type }));
    }

    return res;
  });
}

export function stop(): void {
  inject.uninjectAll();
}
