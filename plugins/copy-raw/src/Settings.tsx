import { components, util } from "replugged";
import { cfg } from ".";

const { SwitchItem } = components;

export function Settings() {
  return (
    <SwitchItem {...util.useSetting(cfg, "swap")} note="Swap the left/right click functionality.">
      Swap left/right click
    </SwitchItem>
  );
}
