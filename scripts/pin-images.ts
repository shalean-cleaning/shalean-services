/* Run: node scripts/pin-images.ts
   Edit REMOTE list with any stable URLs you actually want.
*/
import { writeFile, mkdir } from "node:fs/promises";
import { basename } from "node:path";

const REMOTE = [
  // Add any real images you want to pin locally (must be reachable URLs)
  // "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&w=1600&q=80",
];

const OUT_DIR = "public/images/pinned";

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const url of REMOTE) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const name = basename(new URL(url).pathname) || `img-${Date.now()}.jpg`;
      const file = `${OUT_DIR}/${name}`;
      await writeFile(file, buf);
      console.log(`Saved -> ${file}`);
    } catch (e) {
      console.error(`Failed: ${url}`, e);
    }
  }
}
main().catch((e) => (console.error(e), process.exit(1)));
