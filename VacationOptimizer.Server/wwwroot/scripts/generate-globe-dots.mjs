import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { geoContains } from "d3-geo";
import { feature } from "topojson-client";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const outputPath = path.join(projectRoot, "src", "content", "world-dots.json");

// Grid step in degrees. 1.4deg yields a dense land texture while keeping the
// generated asset small enough to load quickly.
const STEP_DEG = 1.4;
// Crop the empty arctic cap and Antarctica; keeps dots where users actually look.
const LAT_MAX = 84;
const LAT_MIN = -56;

const land = feature(
  require("world-atlas/land-110m.json"),
  require("world-atlas/land-110m.json").objects.land,
);

const dots = [];

for (
  let lat = LAT_MAX, row = 0;
  lat >= LAT_MIN;
  lat -= STEP_DEG, row++
) {
  // Stagger alternate rows for an organic hex-packed look.
  const offset = (row % 2) * (STEP_DEG / 2);
  for (let lng = -180 + offset; lng <= 180; lng += STEP_DEG) {
    if (geoContains(land, [lng, lat])) {
      dots.push([Math.round(lng * 10) / 10, Math.round(lat * 10) / 10]);
    }
  }
}

await fs.writeFile(
  outputPath,
  JSON.stringify({ step: STEP_DEG, latMax: LAT_MAX, latMin: LAT_MIN, dots }),
);

console.log(`world-dots.json written: ${dots.length} dots`);
