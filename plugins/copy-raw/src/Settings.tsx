import { components, util } from "replugged";
import { cfg } from ".";

export function Settings() {
  return (
    <components.SwitchItem
      {...util.useSetting(cfg, "swap")}
      note="Swap the left/right click functionality">
      Swap left/right click
    </components.SwitchItem>
  )
}
