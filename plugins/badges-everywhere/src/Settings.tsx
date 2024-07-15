import type React from "react";
import { components, util } from "replugged";
import { cfg } from ".";

const { SwitchItem, Category, FormNotice } = components;

export function Settings(): React.ReactElement {
  return (
    <>
      <FormNotice
        title="Avoid rate limits"
        body="If disabled, you may be rate limited. Due to the nature of Discord's method of fetching badges (API), users may not have their badges displayed until you click their profile. By disabling this setting, you bypass this and immediately fetch all badges needed to display on screen. This can be prone to rate limits."
        type={FormNotice.Types.DANGER}
        style={{ marginBottom: 20 }}
      />
      <SwitchItem {...util.useSetting(cfg, "avoidrates", true)}>Avoid rate limits</SwitchItem>
      <Category title="Display Badges" open={true}>
        <SwitchItem {...util.useSetting(cfg, "legacyUsername", true)}>
          Display Legacy Username badges
        </SwitchItem>
        <SwitchItem {...util.useSetting(cfg, "staff", true)}>Display Staff badges</SwitchItem>
        <SwitchItem {...util.useSetting(cfg, "partner", true)}>Display Partner badges</SwitchItem>
        <SwitchItem {...util.useSetting(cfg, "moderator", true)}>
          Display Moderator badges
        </SwitchItem>
        <SwitchItem {...util.useSetting(cfg, "hypesquad", true)}>
          Display HypeSquad badges
        </SwitchItem>
        <SwitchItem {...util.useSetting(cfg, "bughunter", true)}>
          Display Bug Hunter badges
        </SwitchItem>
        <SwitchItem {...util.useSetting(cfg, "developer", true)}>
          Display Developer badges
        </SwitchItem>
        <SwitchItem {...util.useSetting(cfg, "earlySupporter", true)}>
          Display Early Supporter badges
        </SwitchItem>
        <SwitchItem
          {...util.useSetting(cfg, "premium", true)}
          note="Both server boosting and Nitro subscription.">
          Display Premium badges
        </SwitchItem>
        <SwitchItem {...util.useSetting(cfg, "bot", true)} note="Includes slash command badge.">
          Display Bot badges
        </SwitchItem>
      </Category>
    </>
  );
}
