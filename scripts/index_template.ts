import { Injector, Logger } from "replugged";
import { filters, waitForModule, waitForProps } from "replugged/webpack";

const inject = new Injector();
const logger = Logger.plugin("{{name}}");

export async function start(): Promise<void> {
  
}

export function stop(): void {
  inject.uninjectAll();
}
