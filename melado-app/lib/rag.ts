// Minimal local RAG over the Melado knowledge base using Ollama embeddings.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { KNOWLEDGE } from "./knowledge";

const OLLAMA = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";
const KB_PATH = join(process.cwd(), "data", "kb-embeddings.json");

type KbEntry = { text: string; embedding: number[] };
type Scored = { text: string; score: number };

let INDEX: KbEntry[] | null = null;
let building: Promise<KbEntry[]> | null = null;

async function embed(text: string, kind: "query" | "document"): Promise<number[]> {
  // nomic-embed-text works best with task prefixes.
  const prefix = kind === "query" ? "search_query: " : "search_document: ";
  const res = await fetch(`${OLLAMA}/api/embeddings`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, prompt: prefix + text }),
  });
  if (!res.ok) throw new Error(`embed failed: ${res.status}`);
  const json = (await res.json()) as { embedding: number[] };
  return json.embedding;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

async function buildIndex(): Promise<KbEntry[]> {
  // 1) Use the precomputed file if present (run `npm run embeddings`).
  try {
    const raw = await readFile(KB_PATH, "utf8");
    const data = JSON.parse(raw) as KbEntry[];
    if (Array.isArray(data) && data.length) return data;
  } catch {
    /* no cache yet — build it now */
  }
  // 2) Otherwise embed on demand and cache to disk.
  const idx: KbEntry[] = [];
  for (const text of KNOWLEDGE) {
    idx.push({ text, embedding: await embed(text, "document") });
  }
  try {
    await mkdir(join(process.cwd(), "data"), { recursive: true });
    await writeFile(KB_PATH, JSON.stringify(idx));
  } catch {
    /* read-only fs is fine; index stays in memory */
  }
  return idx;
}

export async function ensureIndex(): Promise<KbEntry[]> {
  if (INDEX) return INDEX;
  if (!building) {
    building = buildIndex()
      .then((idx) => (INDEX = idx))
      .finally(() => (building = null));
  }
  return building;
}

export async function retrieveScored(query: string, k = 4): Promise<Scored[]> {
  const idx = await ensureIndex();
  const q = await embed(query, "query");
  return idx
    .map((d) => ({ text: d.text, score: cosine(q, d.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

export async function retrieve(query: string, k = 4): Promise<string[]> {
  return (await retrieveScored(query, k)).map((d) => d.text);
}
