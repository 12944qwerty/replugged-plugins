import type { Message } from "discord-types/general";
import { Injector, Logger, common } from "replugged";
import { filters, waitForModule } from "replugged/webpack";

const {
  users: { getCurrentUser },
  messages,
} = common;

const injector = new Injector();
const logger = Logger.plugin("EditUtils");

interface MessageContentProps {
  className?: string;
  message: Message;
  content: React.ReactElement[];
  onUpdate?: () => void;
  contentRef?: React.Ref<HTMLDivElement>;
}

type MessageContent = React.MemoExoticComponent<
  (props: React.PropsWithChildren<MessageContentProps>) => React.ReactElement
>;

export async function start(): Promise<void> {
  const MessageContent: MessageContent | undefined = await waitForModule<Record<string, MessageContent>>(filters.bySource("Messages.MESSAGE_EDITED,")).then(mod => {
    console.log(Object.values(mod).filter(x => x.type && typeof x.type === "function"))
    return Object.values(mod).filter(x => x.type && typeof x.type === "function")[0];
  });

  if (!MessageContent) {
    logger.error("Couldn't find the correct module to inject into.");
    return;
  }

  injector.after(MessageContent, "type", ([{ message }], res) => {
    if (message.author.id === getCurrentUser().id) {
      res.props.onClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
