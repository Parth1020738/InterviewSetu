const GNANI_TTS_URL = "https://api.vachana.ai/api/v1/tts/inference";
const GNANI_STT_URL = "https://api.vachana.ai/stt/v3";

export interface SynthesizeSpeechOptions {
  text: string;
  language?: string; // "hi", "en", "gu", "ta", etc.
  voice?: string; // "Nalini", "Bhavna", "Deepak", etc.
  model?: string; // "timbre-v2.5"
}

export interface TranscribeAudioResult {
  success: boolean;
  transcript: string;
  transcripts?: Record<string, string>;
  model?: string;
  processingTime?: number;
  latency?: number;
  error?: string;
}

/**
 * Ensures audio buffer has a standard 44-byte RIFF WAVE header.
 * Gnani Timbre returns raw 16-bit 48kHz mono PCM, so wrapping with RIFF guarantees
 * universal HTML5 audio playback and seamless STT ingestion.
 */
function addWavHeader(pcmBuffer: ArrayBuffer, sampleRate: number = 48000): ArrayBuffer {
  const bytes = new Uint8Array(pcmBuffer);
  // Check if it already has "RIFF"
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && // 'R'
    bytes[1] === 0x49 && // 'I'
    bytes[2] === 0x46 && // 'F'
    bytes[3] === 0x46    // 'F'
  ) {
    return pcmBuffer;
  }

  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.byteLength;
  const headerSize = 44;
  const outBuffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(outBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  new Uint8Array(outBuffer, headerSize).set(new Uint8Array(pcmBuffer));
  return outBuffer;
}

/**
 * Normalizes language codes for Gnani Timbre TTS
 */
export function normalizeTTSLanguage(lang?: string): string {
  if (!lang) return "hi";
  const lower = lang.toLowerCase();
  if (lower.startsWith("en")) return "en";
  if (lower.startsWith("hi") || lower === "hinglish") return "hi";
  if (lower.startsWith("gu")) return "gu";
  if (lower.startsWith("ta")) return "ta";
  if (lower.startsWith("te")) return "te";
  if (lower.startsWith("mr")) return "mr";
  if (lower.startsWith("bn")) return "bn";
  return "hi";
}

/**
 * Normalizes language codes for Gnani Prisma STT
 */
export function normalizeSTTLanguage(lang?: string): { code: string; multi?: string } {
  if (!lang) return { code: "indic-auto", multi: "hi-IN,en-IN" };
  const lower = lang.toLowerCase();
  if (lower === "hinglish" || lower === "indic-auto") {
    return { code: "indic-auto", multi: "hi-IN,en-IN" };
  }
  if (lower.startsWith("hi")) return { code: "hi-IN" };
  if (lower.startsWith("en")) return { code: "en-IN" };
  if (lower.startsWith("gu")) return { code: "gu-IN" };
  if (lower.startsWith("ta")) return { code: "ta-IN" };
  if (lower.startsWith("te")) return { code: "te-IN" };
  if (lower.startsWith("mr")) return { code: "mr-IN" };
  if (lower.startsWith("bn")) return { code: "bn-IN" };
  return { code: "indic-auto", multi: "hi-IN,en-IN" };
}

/**
 * Calls Gnani Timbre TTS inference endpoint
 * Returns audio ArrayBuffer with guaranteed valid RIFF WAV container
 */
export async function synthesizeSpeech(
  text: string,
  language: string = "hi",
  voice: string = "Nalini"
): Promise<ArrayBuffer> {
  const apiKey = process.env.GNANI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GNANI_API_KEY in server environment.");
  }

  const payload = {
    model: "timbre-v2.5",
    voice: voice || "Nalini",
    text: text.trim(),
    language: normalizeTTSLanguage(language),
  };

  const response = await fetch(GNANI_TTS_URL, {
    method: "POST",
    headers: {
      "X-API-Key-ID": apiKey,
      "Content-Type": "application/json",
      "User-Agent": "InterviewSetu/1.0",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Gnani TTS failed with status ${response.status}: ${errorText || response.statusText}`
    );
  }

  const rawBuffer = await response.arrayBuffer();
  // Ensure valid RIFF header is present
  return addWavHeader(rawBuffer, 48000);
}

/**
 * Calls Gnani Prisma STT endpoint
 * Accepts FormData with 'audio_file' and 'language_code'
 */
export async function transcribeAudio(
  formData: FormData
): Promise<TranscribeAudioResult> {
  const apiKey = process.env.GNANI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GNANI_API_KEY in server environment.");
  }

  // Ensure audio_file is set. If caller provided 'audio', map to 'audio_file'
  if (!formData.has("audio_file") && formData.has("audio")) {
    const audio = formData.get("audio");
    if (audio) {
      formData.set("audio_file", audio);
      formData.delete("audio");
    }
  }

  // Ensure language_code is set
  let langCode = formData.get("language_code")?.toString() || formData.get("language")?.toString();
  if (!langCode) {
    const norm = normalizeSTTLanguage("indic-auto");
    langCode = norm.code;
    formData.set("language_code", norm.code);
    if (norm.multi && !formData.has("multi_lang_codes")) {
      formData.set("multi_lang_codes", norm.multi);
    }
  } else {
    formData.set("language_code", langCode);
    if (langCode === "indic-auto" && !formData.has("multi_lang_codes")) {
      formData.set("multi_lang_codes", "hi-IN,en-IN");
    }
  }

  const response = await fetch(GNANI_STT_URL, {
    method: "POST",
    headers: {
      "X-API-Key-ID": apiKey,
      "User-Agent": "InterviewSetu/1.0",
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Gnani STT failed with status ${response.status}: ${errorText || response.statusText}`
    );
  }

  const data = await response.json();

  let mainTranscript = "";
  let transcriptsRecord: Record<string, string> | undefined;

  if (typeof data.transcript === "string") {
    mainTranscript = data.transcript;
  } else if (data.transcript && typeof data.transcript === "object") {
    transcriptsRecord = data.transcript;
    // Prefer Hindi/Indic if present, or first available string
    mainTranscript =
      data.transcript["hi-IN"] ||
      data.transcript["en-IN"] ||
      Object.values(data.transcript)[0] ||
      "";
  }

  return {
    success: true,
    transcript: mainTranscript.trim(),
    transcripts: transcriptsRecord,
    model: data.model,
    processingTime: data.processing_time,
    latency: data.end_to_end_latency,
  };
}
