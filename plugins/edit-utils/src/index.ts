import { Injector, Logger, common, webpack } from "replugged";
import { Message } from "discord-types/general";
const { waitForModule, filters } = webpack;
const {
  users: { getCurrentUser },
  messages,
} = common;

const injector = new Injector();
const logger = new Logger("Plugin", "EditUtils");

export async function start(): Promise<void> {
  const mod = await waitForModule<Record<string, unknown>>(
    filters.bySource(/:.\.editedTimestamp,/),
  );
  let key;
  for (const k of Object.keys(mod)) {
    if (typeof mod[k] === "object") {
      key = k;
    }
  }
  if (!key) {
    logger.error("Couldn't find the correct module to inject into.");
    return;
  }

  interface MessageContent {
    // shuddup ts
    type: (
      ...args: Array<{
        content: string[];
        message: Message;
      }>
    ) => {
      props: {
        onClick: (e: React.MouseEvent) => unknown;
      };
    };
  }

  // console.log(mod, key);
  injector.after(mod[key] as MessageContent, "type", ([{ message }], res) => {
    if (message.author.id === getCurrentUser().id) {
      res.props.onClick = (e) => {
        if (e.detail > 1) {
          messages.startEditMessage(message.channel_id, message.id, message.content);
        }
      };
    }

    return res;
  });
}

export function stop(): void {
  injector.uninjectAll();
}
