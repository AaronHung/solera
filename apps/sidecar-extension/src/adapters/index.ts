import type { PageContext } from "@solera/contracts";

import { EasyPiAdapter } from "./easyPi";
import { GenericAdapter } from "./generic";
import { PiVisionAdapter } from "./piVision";
import type { AdapterInput, SiteAdapter } from "./types";

const adapters: SiteAdapter[] = [
  new EasyPiAdapter(),
  new PiVisionAdapter(),
  new GenericAdapter(),
];

export function capturePageContext(input: AdapterInput): PageContext {
  const url = new URL(input.url);
  const adapter = adapters.find((candidate) => candidate.matches(url));
  if (!adapter) {
    throw new Error("No Site Adapter is available");
  }
  return adapter.capture(input);
}

export { EasyPiAdapter, GenericAdapter, PiVisionAdapter };
export type { AdapterInput, SiteAdapter };
