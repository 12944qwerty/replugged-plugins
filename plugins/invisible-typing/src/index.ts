import { Injector, common, settings, webpack } from "replugged";
import "./style.css";

const inject = new Injector();

export { Settings } from "./Settings";
import { Icon } from "./Icon";

const { React } = common;

export interface SettingsType {
  button?: boolean;
  invisible?: boolean;
  channelWise?: boolean;
  channels?: Record<string, boolean>;
}
export const cfg = await settings.init<SettingsType>("dev.kingfish.InvisibleTyping");

export async function start(): Promise<void> {
  const typingMod = await webpack.waitForModule<{
    startTyping: (channelId: string) => unknown;
  }>(webpack.filters.byProps("startTyping"));

  inject.instead(
    typingMod,
    "startTyping",
    ([channelId]: [string], original: (channelId: string) => unknown) => {
      const globalInvisible = cfg.get("invisible", true);
      const channelWise = cfg.get("button", true) ? cfg.get("channelWise", true) : false;
      const channels = cfg.get("channels", { [channelId]: globalInvisible });
      if (channelWise ? channels[channelId] : globalInvisible) {
        return null;
      } else {
        return original(channelId);
      }
    },
  );

  const mod = await webpack.waitForModule<{
    type: (args: { type: { analyticsName: string } }) => React.ReactElement;
  }>(webpack.filters.bySource("ChannelTextAreaButtons"));
  inject.after(mod, "type", ([ args ], res) => {
    res.props.children.splice(1, 0, React.createElement(Icon, { type: args.type }));

    return res;
  });
}

export function stop(): void {
  inject.uninjectAll();
}
