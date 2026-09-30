// Free models on OpenRouter (the ":free" ones cost nothing).
// The free list changes often — see https://openrouter.ai/models?max_price=0
export const MODELS = [
  { id: "google/gemma-4-31b-it:free", label: "Gemma 4 31B" },
  { id: "qwen/qwen3.8-27b:free", label: "Qwen3.8 27B" },
  { id: "nvidia/nemotron-3-ultra-550b-a55b:free", label: "Nemotron 3 Ultra" },
  { id: "thinkingmachines/inkling:free", label: "Inkling" },
  { id: "inclusionai/ling-3.0-flash-sante:free", label: "inclusionai: Ling 3.0 Flash Sante" },
];

export const DEFAULT_MODEL = MODELS[0].id;
