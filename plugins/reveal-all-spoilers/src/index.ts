import type React from "react";
import { Injector, Logger } from "replugged";
import { filters, getFunctionBySource, waitForModule } from "replugged/webpack";

const inject = new Injector();
const logger = Logger.plugin("RevealAllSpoilers");

interface ObscuredElementProps {
  children: (value: boolean) => React.ReactElement;
}

declare class SpoilerComponent extends React.PureComponent {
  public renderWithTooltip: (obscuredElement: React.ReactElement<ObscuredElementProps>) => void;
}

export async function start(): Promise<void> {
  const Spoiler = await waitForModule(filters.bySource("renderObscuredText")).then((mod) =>
    getFunctionBySource<typeof SpoilerComponent>(mod, "renderObscuredText"),
  );

  if (!Spoiler) {
    logger.error("Couldn't find the correct module to inject into.");
    return;
  }

  inject.before(Spoiler.prototype, "renderWithTooltip", ([args]) => {
    const orig = args.props.children;
    args.props.children = (r) => {
      const res = orig(r);

      const { onClick } = res.props;
      if (!onClick) return res;

      res.props.onClick = (e: MouseEvent) => {
        if (e.metaKey || e.ctrlKey) {
          const { target } = e;
          if (!target) return;
          (target as HTMLElement).parentNode
            ?.querySelectorAll("[class^='spoilerContent']")
            .forEach((e) => (e as HTMLElement).click());
        }
        onClick(e);
      };

      return res;
    };
  });
}

export function stop(): void {
  inject.uninjectAll();
}
