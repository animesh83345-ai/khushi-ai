import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(
  __dirname,
  "..",
  "data"
);

const memoryFile = path.join(
  dataDir,
  "chats.json"
);

async function ensureMemoryFile() {
  await fs.mkdir(
    dataDir,
    { recursive: true }
  );

  try {
    await fs.access(memoryFile);
  } catch {
    await fs.writeFile(
      memoryFile,
      "[]",
      "utf8"
    );
  }
}

export async function getMemory() {
  await ensureMemoryFile();

  const data =
    await fs.readFile(
      memoryFile,
      "utf8"
    );

  return JSON.parse(data);
}

export async function saveMemory(item) {
  const memory =
    await getMemory();

  memory.push({
    role: item.role,
    content: item.content,
    timestamp:
      new Date().toISOString()
  });

  const latest =
    memory.slice(-100);

  await fs.writeFile(
    memoryFile,
    JSON.stringify(
      latest,
      null,
      2
    ),
    "utf8"
  );

  return latest;
}

export async function clearMemory() {
  await ensureMemoryFile();

  await fs.writeFile(
    memoryFile,
    "[]",
    "utf8"
  );
}