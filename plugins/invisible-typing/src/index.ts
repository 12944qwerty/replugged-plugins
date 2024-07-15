import { Injector, common, settings, webpack } from "replugged";
import "./style.css";

import { Icon } from "./Icon";
export { Settings } from "./Settings";

const inject = new Injector();

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

  const ChannelTextAreaButtons = await webpack.waitForModule<{
    type: (args: { type: { analyticsName: string } }) => React.ReactElement | null;
  }>(webpack.filters.bySource(/{disabled:\w+,type:\w+},"emoji"/));
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
