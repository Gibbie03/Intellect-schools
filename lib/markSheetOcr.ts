const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-5';

export type ExtractedRow = {
  label: string;
  score: number | null;
  caScore: number | null;
  examScore: number | null;
};

const SYSTEM_PROMPT = `You read photographs of school mark sheets / result registries (printed or handwritten tables of student scores) and extract them into structured data.

Return ONLY a JSON object of this exact shape, with no markdown fences and no other text:
{"rows": [{"label": "<student ID or name exactly as written>", "score": <number or null>, "caScore": <number or null>, "examScore": <number or null>}]}

Rules:
- One entry per student row in the sheet.
- If the sheet has separate "CA"/"Continuous Assessment" and "Exam"/"Test" columns, fill caScore and examScore and leave score null.
- If the sheet only has a single combined score/total column, fill score and leave caScore/examScore null.
- "label" is whatever identifies the student in that row -- a student ID if present, otherwise the name exactly as written.
- If a cell is illegible or blank, use null for that number rather than guessing.
- Do not invent rows or students that aren't in the image.`;

/**
 * Sends a mark-sheet photo to a vision-capable Claude model and returns the
 * extracted rows. This is a best-effort read of a photograph (often
 * handwritten) -- callers must treat the result as a draft for a human to
 * review and correct, never as data to save directly.
 */
export async function extractMarkSheet(imageBuffer: Buffer, mediaType: string): Promise<ExtractedRow[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Photo upload is not configured. Set ANTHROPIC_API_KEY in your environment.');
  }

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageBuffer.toString('base64') },
            },
            { type: 'text', text: 'Extract every student row from this mark sheet as instructed.' },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Photo reading failed (${res.status}). ${detail.slice(0, 200)}`);
  }

  const data = await res.json();
  const text: string = data?.content?.[0]?.text ?? '';
  const jsonText = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');

  let parsed: { rows?: unknown };
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('Could not read a mark sheet from that photo. Try a clearer, well-lit picture.');
  }

  if (!Array.isArray(parsed.rows)) {
    throw new Error('Could not read a mark sheet from that photo. Try a clearer, well-lit picture.');
  }

  return parsed.rows.map((r) => {
    const row = r as Record<string, unknown>;
    return {
      label: String(row.label ?? '').trim(),
      score: row.score === null || row.score === undefined ? null : Number(row.score),
      caScore: row.caScore === null || row.caScore === undefined ? null : Number(row.caScore),
      examScore: row.examScore === null || row.examScore === undefined ? null : Number(row.examScore),
    };
  });
}
