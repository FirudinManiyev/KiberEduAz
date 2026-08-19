import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { getLocalRoomDefinition } from "@/lib/content/catalog";
import { parseLocalMarkdown } from "@/lib/content/markdown-parser";
import type { LocalRoomDetail } from "@/lib/content/types";

export async function loadLocalRoom(slug: string): Promise<LocalRoomDetail | null> {
  const definition = getLocalRoomDefinition(slug);
  if (!definition) return null;

  const filePath = path.join(process.cwd(), "src", "data", definition.sourceFile);
  const source = await readFile(filePath, "utf8");
  return parseLocalMarkdown(definition, source);
}

