import { readFile } from "node:fs/promises";
import path from "node:path";

// Se genera una vez al compilar: cada despliegue produce un /sw.js distinto.
export const dynamic = "force-static";

const VERSION =
  process.env.VERCEL_DEPLOYMENT_ID ??
  process.env.VERCEL_GIT_COMMIT_SHA ??
  new Date().toISOString();

export async function GET() {
  const source = await readFile(path.join(process.cwd(), "lib/pwa/sw.js"), "utf8");
  return new Response(`const VERSION = ${JSON.stringify(VERSION)};\n${source}`, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
