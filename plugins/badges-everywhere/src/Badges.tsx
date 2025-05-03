import { User } from "discord-types/general";
import type React from "react";
import { components, webpack } from "replugged";
import { Badge, SettingsType, UserProfile, cfg, logger } from ".";

const { Tooltip } = components;

const BadgeSettingMapping: Record<string, keyof SettingsType> = {
  legacy_username: "legacyUsername",
  staff: "staff",
  partner: "partner",
  hypesquad_house: "hypesquad",
  bug_hunter: "bughunter",
  early_supporter: "earlySupporter",
  active_developer: "developer",
  verified_developer: "developer",
  certified_moderator: "moderator",
  premium: "premium",
  guild_booster_lvl: "premium",
  bot_commands: "bot",
  quest_completed: "quest",
};

export function Badge(badge: Badge): React.ReactElement | null {
  const anchorClasses = webpack.getByProps<Record<"anchor" | "anchorUnderlineOnHover", string>>("anchor", "anchorUnderlineOnHover");
  if (!anchorClasses) {
    logger.error("Failed to get anchor classes");
    return null;
  }
  const { badge: badgeClass } = webpack.getByProps<Record<"badge" | "container", string>>(
    "badge",
    "container",
  ) || {};
  if (!badgeClass) {
    logger.error("Failed to get badge class");
    return null;
  }

  if (badge.link) {
    return (
      <Tooltip text={badge.description}>
        <a
          rel="noreferrer noopener"
          target="_blank"
          role="button"
          href={badge.link}
          tabIndex={0}
          className={`${anchorClasses.anchor} ${anchorClasses.anchorUnderlineOnHover}`}>
          <img alt="" src={badge.src} className={badgeClass} />
        </a>
      </Tooltip>
    );
  } else {
    return (
      <Tooltip text={badge.description}>
        <span role="button" tabIndex={0}>
          <img alt="" src={badge.src} className={badgeClass} />
        </span>
      </Tooltip>
    );
  }
}

export const cache: Record<string, User> = {};

export default function Badges(getImageUrl: (id: string) => string) {
  return (props: { user?: UserProfile }): React.ReactElement | null => {
    let { user } = props;

    if (user?.badges) {
      let badges = user.badges
        .map((badge) => {
          badge.src = getImageUrl(badge.icon);

          for (const key in BadgeSettingMapping) {
            if (badge.id.startsWith(key)) {
              if (!cfg.get(BadgeSettingMapping[key], true)) {
                return false;
              }
            }
          }

          return badge;
        })
        .filter(Boolean) as Badge[];

      return <div className="badges-everywhere">{badges.map(Badge)}</div>;
    } else {
      return null;
    }
  };
}
