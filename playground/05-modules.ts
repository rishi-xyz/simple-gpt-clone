// Run me:  bun playground/05-modules.ts
// Phase 03 · modules and environment variables
import { MODELS, DEFAULT_MODEL } from "./models";

console.log("default model:", DEFAULT_MODEL);
for (const m of MODELS) console.log(" -", m.label, `(${m.id})`);

// Environment variables come from the shell or a .env file.
// Try:  MY_NAME=Asha bun playground/05-modules.ts
console.log("MY_NAME =", process.env.MY_NAME ?? "(not set)");
