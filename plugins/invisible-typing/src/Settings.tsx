import { components, util } from "replugged";
import { cfg } from ".";

const { SwitchItem } = components;

export function Settings(): React.ReactElement {
  return (
    <>
      <SwitchItem {...util.useSetting(cfg, "button", true)}>Show Button on ChatBar</SwitchItem>
      <SwitchItem
        {...util.useSetting(cfg, "channelWise", true)}
        note="Will make it so the chat bar button toggles it for current channel only not globally."
        disabled={!cfg.get("button", true)}
        key={`${!cfg.get("button", true)}`}>
        Make Chatbar button toggle it just for channel
      </SwitchItem>
      <SwitchItem
        {...util.useSetting(cfg, "invisible", true)}
        note="When enabled, invisibility applies to all channels. When disabled, invisibility is channel based.">
        Enable Global Invisible Typing
      </SwitchItem>
    </>
  );
}
