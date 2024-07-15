import { Buffer } from "buffer/";
import type { Guild } from "discord-types/general";
import { Injector, Logger, common, components, types, webpack } from "replugged";

const {
  ContextMenu: { MenuItem, MenuGroup },
} = components;
const { flux, guilds, toast } = common;
const { ContextMenuTypes } = types;

const injector = new Injector();
const logger = Logger.plugin("EmojiUtils");

declare class PermissionStore extends flux.Store {
  public getGuildPermissionProps: (guild: Guild) => {
    canManageGuildExpressions: boolean;
  };
}

async function getImageData(url: string): Promise<string> {
  const req = await fetch(url);
  const buf = Buffer.from(await req.arrayBuffer()).toString("base64");
  return `data:${req.headers.get("content-type")};base64,${buf}`;
}

export async function start(): Promise<void> {
  const mod = await webpack.waitForModule<Record<string, unknown>>(
    webpack.filters.bySource(
      'document.queryCommandEnabled("copy")||document.queryCommandSupported("copy")',
    ),
  );

  const Clipboard = {
    copy: Object.values(mod).find((e) => typeof e === "function") as (
      content: string,
    ) => boolean | void,
    SUPPORTED: Object.values(mod).find((e) => typeof e === "boolean") as boolean,
  };

  const PermissionStore = webpack.getByStoreName<PermissionStore>("PermissionStore")!;

  const { uploadEmoji } = await webpack.waitForProps<{
    uploadEmoji: (args: {
      guildId: string;
      image: string;
      name: string;
      roles?: string[];
    }) => Promise<unknown>;
  }>("uploadEmoji");

  injector.utils.addMenuItem(ContextMenuTypes.Message, (data) => {
    if (data.favoriteableType === "emoji" && data.favoriteableName === null) {
      return (
        <MenuGroup>
          <MenuItem id="emoji-utils-clone" label="Steal Emoji">
            {Object.values(guilds.getGuilds())
              .map((guild) => {
                if (PermissionStore.getGuildPermissionProps(guild).canManageGuildExpressions)
                  return (
                    <MenuItem
                      id={`emoji-utils-clone-server${guild.id}`}
                      label={guild.name}
                      action={async () => {
                        try {
                          const matches = new RegExp(`<a?:(.+?):${data.favoriteableId}>`).exec(
                            (data.message as Record<string, string>).content,
                          );
                          if (!matches) {
                            // Should never happen theoretically
                            logger.error("Failed to steal emoji: cannot find name of emoji");
                            toast.toast("Failed to steal emoji", toast.Kind.FAILURE);
                            return;
                          }
                          const name = matches[1];

                          await uploadEmoji({
                            guildId: guild.id,
                            image: await getImageData(data.itemSrc as string),
                            name,
                          });
                          toast.toast("Emoji stolen!", toast.Kind.SUCCESS);
                        } catch (e) {
                          logger.error("Failed to steal emoji", e);
                          toast.toast("Failed to steal emoji", toast.Kind.FAILURE);
                        }
                      }}
                    />
                  );
                return false;
              })
              .filter(Boolean)}
          </MenuItem>
          <MenuItem
            id="emoji-utils-copy-id"
            label="Copy Emoji ID"
            action={() => {
              if (Clipboard.SUPPORTED) {
                Clipboard.copy(data.favoriteableId as string);
                toast.toast("Copied to clipboard!", toast.Kind.SUCCESS);
              } else {
                toast.toast(
                  "Your browser does not support copying to clipboard",
                  toast.Kind.FAILURE,
                );
              }
            }}
          />
        </MenuGroup>
      );
    }
  });
}

export function stop(): void {
  injector.uninjectAll();
}
