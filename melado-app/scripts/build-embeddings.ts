// Precompute KB embeddings into data/kb-embeddings.json
// Requires Ollama running with the embed model pulled.
//   ollama pull nomic-embed-text
//   npm run embeddings   (runs via tsx)
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { KNOWLEDGE } from "../lib/knowledge";

const OLLAMA = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";

async function embed(text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA}/api/embeddings`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model: MODEL, prompt: "search_document: " + text }),
  });
  if (!res.ok) throw new Error(`embed failed ${res.status}: ${await res.text()}`);
  return ((await res.json()) as { embedding: number[] }).embedding;
}

async function main(): Promise<void> {
  const idx: { text: string; embedding: number[] }[] = [];
  let i = 0;
  for (const text of KNOWLEDGE) {
    process.stdout.write(`embedding ${++i}/${KNOWLEDGE.length}\r`);
    idx.push({ text, embedding: await embed(text) });
  }
  await mkdir(join(process.cwd(), "data"), { recursive: true });
  await writeFile(join(process.cwd(), "data", "kb-embeddings.json"), JSON.stringify(idx));
  console.log(`\nWrote data/kb-embeddings.json (${idx.length} chunks, dim ${idx[0]?.embedding.length}).`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
