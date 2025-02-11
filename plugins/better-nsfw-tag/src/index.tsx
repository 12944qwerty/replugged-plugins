import type { Channel } from "discord-types/general";
import type React from "react";
import { Injector, Logger } from "replugged";
import { Tree, findInReactTree } from "replugged/util";
import {
  filters,
  getFunctionBySource,
  getFunctionKeyBySource,
  waitForModule,
} from "replugged/webpack";

const inject = new Injector();
const logger = Logger.plugin("BetterNSFWTag");

interface ChannelItemModule {
  default: React.FC<{ channel: Channel }>;
}

interface TextBadgeProps {
  text: string;
  style: React.CSSProperties;
}

export async function start(): Promise<void> {
  const mod = await waitForModule<ChannelItemModule>(filters.bySource(".unreadImportant:"));
  const key = getFunctionKeyBySource(mod, ".unreadImportant:");

  if (!key) {
    logger.error("Couldn't find the correct module to inject into.");
    return;
  }

  const badgesMod = await waitForModule(filters.bySource(".textBadge,"));
  const TextBadge = getFunctionBySource<React.FC<TextBadgeProps>>(badgesMod, "textBadge");

  if (!TextBadge) {
    logger.error("Couldn't find the TextBadge component.");
    return;
  }

  inject.after(mod, key, ([{ channel }], res) => {
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
