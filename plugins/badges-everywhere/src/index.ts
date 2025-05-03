import type { Channel, Message, User } from "discord-types/general";
import { Injector, Logger, common, settings, webpack } from "replugged";
import type { Badge as APIBadge } from "replugged/types";

const { React, flux } = common;

import "./style.css";

import badges from "./Badges";
export { Settings } from "./Settings";

const injector = new Injector();
export const logger = Logger.plugin("BadgesEverywhere");

export interface SettingsType {
  legacyUsername?: boolean;
  staff?: boolean;
  partner?: boolean;
  moderator?: boolean;
  hypesquad?: boolean;
  bughunter?: boolean;
  developer?: boolean;
  earlySupporter?: boolean;
  bot?: boolean;
  premium?: boolean;
  avoidrates?: boolean;
  quest?: boolean;
}
export const cfg = settings.init<SettingsType>("dev.kingfish.BadgesEverywhere");

export interface Badge extends APIBadge {
  src: string;
}

export type UserProfile = {
  premiumSince: Date | null;
  premiumGuildSince: Date | null;
  badges?: Badge[];
} & Record<string, string>;

declare class UserProfileStore extends flux.Store {
  public isFetchingProfile: (userId: string) => boolean;
  public getUserProfile: (userId: string) => UserProfile | undefined;
}

export async function start(): Promise<void> {
  const UserProfileStore = webpack.getByStoreName<UserProfileStore>("UserProfileStore")!;

  const getImageUrl = webpack.getFunctionBySource<(id: string) => string>(
    await webpack.waitForModule(webpack.filters.bySource("BADGE_ICON(")),
    "BADGE_ICON(",
  )!;

  const fetchUser = webpack.getFunctionBySource<(id: string) => unknown>(
    await webpack.waitForModule(webpack.filters.bySource('"USER_PROFILE_FETCH_START"')),
    (source) =>
      source.toString().includes('"USER_PROFILE_FETCH_START"') || source.toString().length < 50,
  );

  const Badges = badges(getImageUrl);

  const mod = await webpack.waitForModule<{
    default: (
      ...args: Array<{
        decorations: React.ReactElement[][];
        message: Message;
        author: User;
        channel: Channel;
      }>
    ) => React.ReactElement;
  }>(webpack.filters.bySource('"BADGES"'));

  const key = webpack.getFunctionKeyBySource(mod, "decorations");

  if (!key) {
    logger.error("Couldn't find the correct module to inject into.");
    return;
  }

  injector.after(mod, key, ([args], res) => {
    const { author } = args.message;
    const userProfile = UserProfileStore.getUserProfile(author.id);
    if (
      !cfg.get("avoidrates", true) &&
      !userProfile &&
      !UserProfileStore.isFetchingProfile(author.id)
    ) {
      if (fetchUser) {
        fetchUser(author.id);
      } else {
        return res;
      }
    }

    if (res.props.children) {
      res.props.children.push(
        React.createElement(Badges, { user: UserProfileStore.getUserProfile(author.id) }),
      );
    }

    return res;
  });
}

export function stop(): void {
  injector.uninjectAll();
}
