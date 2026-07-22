// supabase/functions/translate/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ContextItem = { speaker?: string; text?: string };

function extractText(data: any): string {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }
  const parts: string[] = [];
  for (const item of data?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (typeof content?.text === "string") parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST 요청만 허용됩니다." }, 405);

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되지 않았습니다.");

    const body = await req.json();
    const mode = body?.mode || "translate";
    const model = Deno.env.get("OPENAI_MODEL") || "gpt-4.1-mini";
    const visionModel = Deno.env.get("OPENAI_VISION_MODEL") || model;

    let payload: Record<string, unknown>;

    if (mode === "vision") {
      const image = String(body?.image || "");
      if (!image.startsWith("data:image/")) {
        return json({ error: "이미지 데이터가 필요합니다." }, 400);
      }

      payload = {
        model: visionModel,
        instructions: [
          "You are a Korean travel assistant for a Hawaii trip.",
          "Read the image carefully.",
          "Translate visible English into Korean.",
          "Summarize prices, conditions, warnings, allergens, fees, dates and times.",
          "Never invent unreadable text.",
          "Clearly say '확인 불가' for uncertain content.",
          "Respond in Korean with compact headings."
        ].join(" "),
        input: [{
          role: "user",
          content: [
            {
              type: "input_text",
              text: "이 메뉴판, 표지판, 영수증 또는 여행 관련 사진을 분석하고 한국어로 설명해줘."
            },
            { type: "input_image", image_url: image }
          ]
        }],
        max_output_tokens: 700
      };
    } else if (mode === "assistant") {
      const text = String(body?.text || "").trim().slice(0, 3000);
      if (!text) return json({ error: "상황 설명이 필요합니다." }, 400);

      payload = {
        model,
        instructions: `You are a practical Korean travel assistant for a Hawaii trip.
Return valid JSON only. The response must be a JSON object with these keys:
summary: concise Korean explanation of the situation,
english: one or more natural, polite English sentences the traveler can say immediately,
actions: array of 2 to 4 concise Korean next-step suggestions.
Preserve names, prices, dates, times and reservation details.
Do not invent facts.`,
        input: text,
        max_output_tokens: 500,
        text: { format: { type: "json_object" } }
      };
    } else {
      const text = String(body?.text || "").trim().slice(0, 3000);
      if (!text) return json({ error: "번역할 text가 필요합니다." }, 400);

      const source = body?.source === "ko" ? "Korean" : "English";
      const target = body?.target === "en" ? "English" : "Korean";
      const style =
        body?.style === "literal" ? "close to the source" :
        body?.style === "simple" ? "short and simple" :
        "natural and polite";
      const context: ContextItem[] = Array.isArray(body?.context)
        ? body.context.slice(-6)
        : [];

      const contextText = context
        .map((x) => `${String(x.speaker || "speaker")}: ${String(x.text || "").slice(0, 500)}`)
        .join("\n");

      payload = {
        model,
        instructions: [
          "You are a real-time Korean-English travel interpreter.",
          `Translate from ${source} to ${target}.`,
          `Use ${style} language.`,
          "Preserve names, reservation numbers, prices, addresses, dates and times.",
          "Use recent context only to resolve ambiguity.",
          "Return only the translation."
        ].join(" "),
        input: contextText
          ? `Recent context:\n${contextText}\n\nText:\n${text}`
          : `Text:\n${text}`,
        max_output_tokens: 300
      };
    }

    const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await openAIResponse.json();

    if (!openAIResponse.ok) {
      console.error("OpenAI API error:", data);
      throw new Error(data?.error?.message || "OpenAI API 요청 실패");
    }

    const output = extractText(data);
    if (!output) throw new Error("GPT 응답 결과가 없습니다.");

    if (mode === "assistant") {
      try {
        return json(JSON.parse(output));
      } catch {
        return json({ summary: output, english: "", actions: [] });
      }
    }

    if (mode === "vision") return json({ result: output });
    return json({ translatedText: output });
  } catch (error) {
    console.error(error);
    return json({
      error: error instanceof Error ? error.message : "처리 실패"
    }, 500);
  }
});
