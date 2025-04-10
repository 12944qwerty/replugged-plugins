import type { Channel } from "discord-types/general";
import type React from "react";
import { Injector, Logger } from "replugged";
import { Tree, findInReactTree } from "replugged/util";
import { filters, getFunctionKeyBySource, waitForModule, waitForProps } from "replugged/webpack";

const inject = new Injector();
const logger = Logger.plugin("BetterNSFWTag");

interface ChannelItemModule {
  render: React.FC<{ channel: Channel }>;
  [key: string]: unknown;
}
interface ChannelItemModuleAH {
  render?: React.FC<{ channel: Channel }>;
  [key: string]: unknown;
}

export async function start(): Promise<void> {
  const mod = await waitForModule<Record<string, ChannelItemModuleAH> | null>(filters.bySource(".unreadImportant:"));
  if (typeof mod !== "object" || mod === null) {
    logger.error("Couldn't find the correct module to inject into.");
    return;
  }

  let obj;
  for (const k in mod) {
    try {
      const v = mod[k];
      if (typeof v === "object") {
        if (v.render) {
          obj = v;
          break;
        }
      }
    } catch {}
  }

  if (!obj) {
    logger.error("Couldn't find the correct module to inject into.");
    return;
  }

  const badgeClasses = await waitForProps<Record<"textBadge" | "numberBadge", string>>("textBadge", "numberBadge");
  const { mentionsBadge } = await waitForProps<Record<"mentionsBadge", string>>("mentionsBadge");

  if (obj.render) {
    inject.after(obj as ChannelItemModule, "render", ([{ channel }], res) => {
      if (!channel.nsfw) return;

      const badge = findInReactTree(
        res as unknown as Tree,
        (r) => Boolean(r?.className) && (r?.className as string).includes("linkTop"),
      );

      if (!badge) return;

      (badge.children as JSX.Element[]).splice(
        2,
        0,
        <div className={mentionsBadge}>
          <div className={badgeClasses.textBadge} style={{backgroundColor: "var(--status-danger)"}}>
            NSFW
          </div>
        </div>,
      );
    });
  }
}

export function stop(): void {
  inject.uninjectAll();
}
