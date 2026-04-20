/**
 * Torqued AI layer — Anthropic Claude wrappers.
 *
 * Workloads: photo inference (OCR OE numbers + part type), listing cleanup,
 * SEO content generation, fitment disambiguation.
 * See docs/03_TORQUED_MVP_BRIEF.md §10.
 */

export { createAnthropicClient } from "./src/client";
export { PHOTO_INFERENCE_PROMPT, parsePhotoInference } from "./src/prompts/photo-inference";
export type { PhotoInferenceResult } from "./src/prompts/photo-inference";
