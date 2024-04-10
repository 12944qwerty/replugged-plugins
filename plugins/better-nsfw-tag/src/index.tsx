import { Injector } from "replugged";
import { filters, waitForModule, waitForProps } from "replugged/webpack";
import { Tree, findInReactTree } from "replugged/util";
import { Channel } from "discord-types/general";

const inject = new Injector();

interface ChannelComp {
  default: (args: { channel: Channel }) => React.ReactElement;
}

interface TextBadgeProps {
  text: string;
  style: React.CSSProperties;
}

export async function start(): Promise<void> {
  const ChannelComp = await waitForModule<ChannelComp>(filters.bySource(".unreadImportant:"));
  const { TextBadge } = await waitForProps<{
    TextBadge: React.FunctionComponent<TextBadgeProps>;
  }>("TextBadge");

  inject.after(ChannelComp, "default", ([{ channel }], res) => {
    if (!channel.nsfw) return;

    const badge = findInReactTree(
      res as unknown as Tree,
      (r) => Boolean(r?.className) && (r?.className as string).includes("linkTop"),
    );

    if (!badge) return;

    (badge.children as JSX.Element[]).splice(
      2,
      0,
      <TextBadge text="NSFW" style={{ borderRadius: "3px" }} />,
    );
  });
}

export function stop(): void {
  inject.uninjectAll();
}
