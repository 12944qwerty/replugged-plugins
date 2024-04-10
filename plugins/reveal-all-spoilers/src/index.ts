import { Injector } from "replugged";
import { filters, waitForModule } from "replugged/webpack";

const inject = new Injector();

interface Spoiler {
  default: {
    prototype: {
      renderWithTooltip: (args: {
        props: {
          children: (r: unknown) => React.ReactElement;
        };
      }) => unknown;
    };
  };
}

export async function start(): Promise<void> {
  const Spoiler = await waitForModule<Spoiler>(filters.bySource("renderObscuredText"));

  inject.before(Spoiler.default.prototype, "renderWithTooltip", ([args]) => {
    const orig = args.props.children;
    args.props.children = (r: unknown) => {
      const res = orig(r);

      const { onClick } = res.props;
      if (!onClick) return res;

      res.props.onClick = (e: MouseEvent) => {
        if (e.metaKey || e.ctrlKey) {
          const { target } = e;
          if (!target) return;
          (target as HTMLElement).parentNode
            ?.querySelectorAll(".spoilerContent__383f3")
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
