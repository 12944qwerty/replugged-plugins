import { Injector, Logger, webpack } from "replugged";

const inject = new Injector();
const logger = Logger.plugin("MoreInvites");

const DSC_REGEX = /(?<!<)(?:https?:\/\/)?dsc\.gg\/(\w+?)(?:$|[^\w>])/gm;

type CodedLinks = Array<{
  code?: string;
  type: string;
  from?: string; // for us
}>;

const cache: Record<
  string,
  {
    code?: string;
    fetching: boolean;
  }
> = {};

async function getCode(code: string): Promise<string | undefined> {
  if (cache[code] && !cache[code].fetching) {
    return cache[code].code;
  }

  if (!cache[code]?.fetching) {
    cache[code] = {
      fetching: true,
    };
    const options = {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36",
      },
    };

    const res = await fetch(`https://dsc.gg/${code}`, options);

    if (res.status !== 200) {
      logger.error(`Couldn't fetch code ${code} from dsc.gg. Status: ${res.status}`);
      return "";
    }

    if (res.url) {
      if (res.url.includes("discord.com/invite")) {
        // not bot invite link
        cache[code].code = res.url.split("/")[4];
        cache[code].fetching = false;

        return cache[code].code;
      }
    }
  }
}

export async function start(): Promise<void> {
  const mod = await webpack.waitForModule<Record<string, (args: string) => CodedLinks>>(
    webpack.filters.bySource(".URL_REGEX)"),
  );
  const key = webpack.getFunctionKeyBySource(mod, ".URL_REGEX)");

  if (mod && key) {
    inject.after(mod, key, ([args], res) => {
      if (args) {
        const matches = [...new Set([...args.matchAll(DSC_REGEX)].map((match) => match[1]))];
        for (const code of matches) {
          getCode(code)
            .then((code) => {
              if (code) {
                res.push({
                  code,
                  type: "INVITE",
                  from: "dsc.gg",
                });
              }
            })
            .catch((err) => {
              logger.error(`Couldn't fetch ${code} from dsc.gg. Error: ${err}`);
            });
        }
      }

      res = res.filter(
        (val, index, self) =>
          index === self.findIndex((t) => t.code === val.code && t.type === val.type),
      );

      return res;
    });
  }
}

export function stop(): void {
  inject.uninjectAll();
}
