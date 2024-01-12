import { Guild } from "discord-types/general";
import { Injector, Logger, common, components, types, webpack } from "replugged";
import { Buffer } from "buffer/";
const {
  ContextMenu: { MenuItem, MenuGroup },
} = components;
const { flux, guilds, toast } = common;
const { ContextMenuTypes } = types;

const logger = Logger.plugin("Emoji Utils");
const injector = new Injector();

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

  const Clipboard: {
    SUPPORTED: boolean;
    copy: (content: string) => unknown;
  } = {
    copy: Object.values(mod).find((e) => typeof e === "function") as (args: string) => void,
    SUPPORTED: Object.values(mod).find((e) => typeof e === "boolean") as boolean,
  };

  const PermissionsStore = webpack.getByStoreName(
    "PermissionStore",
  ) as unknown as typeof flux.Store & {
    getGuildPermissionProps: (guild: Guild) => {
      canManageGuildExpressions: boolean;
    };
  };

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
                if (PermissionsStore.getGuildPermissionProps(guild).canManageGuildExpressions)
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
                            logger.error("Failed to steal emoji: Cannot find name of emoji");
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
