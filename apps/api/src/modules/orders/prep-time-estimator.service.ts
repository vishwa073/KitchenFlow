type PrepTimeItem = {
  name: string;
  quantity: number;
  prepTimeMin: number;
  complexity?: "LOW" | "MEDIUM" | "HIGH";
};

type PrepTimeInput = {
  items: PrepTimeItem[];
  activeKitchenOrders: number;
  kitchenCapacity: number;
  minimumPrepTimeMin: number;
};

export type PrepTimeEstimateResult = {
  estimatedPrepMinutes: number;
  reason: string;
  source: "AI" | "FALLBACK";
};

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

function deterministicEstimate(
  input: PrepTimeInput,
): PrepTimeEstimateResult {
  const itemPrepMinutes = input.items.reduce((total, item) => {
    const complexityMultiplier =
      item.complexity === "HIGH"
        ? 1.5
        : item.complexity === "MEDIUM"
          ? 1.2
          : 1;

    return (
      total +
      Math.max(1, item.prepTimeMin) *
        Math.max(1, item.quantity) *
        complexityMultiplier
    );
  }, 0);

  const capacity = Math.max(1, input.kitchenCapacity);
  const workloadFactor = 1 + input.activeKitchenOrders / capacity;

  const estimate = Math.ceil(itemPrepMinutes * workloadFactor);

  return {
    estimatedPrepMinutes: Math.max(
      input.minimumPrepTimeMin,
      estimate,
    ),
    reason:
      "Fallback estimate based on menu preparation times and current kitchen workload.",
    source: "FALLBACK",
  };
}

function isValidEstimate(value: unknown): value is {
  estimated_prep_minutes: number;
  reason: string;
} {
  if (!value || typeof value !== "object") return false;

  const result = value as Record<string, unknown>;

  return (
    typeof result.estimated_prep_minutes === "number" &&
    Number.isFinite(result.estimated_prep_minutes) &&
    Number.isInteger(result.estimated_prep_minutes) &&
    result.estimated_prep_minutes >= 1 &&
    result.estimated_prep_minutes <= 240 &&
    typeof result.reason === "string" &&
    result.reason.trim().length > 0
  );
}

export async function estimatePrepTime(
  input: PrepTimeInput,
): Promise<PrepTimeEstimateResult> {
  const fallback = deterministicEstimate(input);

  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL ?? "openai/gpt-oss-20b";

  if (!apiKey) {
    console.warn("GROQ_API_KEY missing. Using fallback prep estimate.");
    return fallback;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_tokens: 250,
          response_format: {
            type: "json_object",
          },
          messages: [
            {
              role: "system",
              content: `
You estimate food preparation time for a restaurant kitchen.

Return only valid JSON with:
{
  "estimated_prep_minutes": integer,
  "reason": "short explanation"
}

Rules:
- Estimate realistic kitchen preparation time in minutes.
- Consider quantities, menu preparation times, complexity, active orders,
  and kitchen capacity.
- Do not estimate below the outlet's minimum prep time.
- Do not exceed 240 minutes.
- Do not return markdown.
              `.trim(),
            },
            {
              role: "user",
              content: JSON.stringify(input),
            },
          ],
        }),
      });

      if (!response.ok) {
        console.error(
          `Groq prep estimation failed with HTTP ${response.status}`,
        );
        return fallback;
      }

      const data = (await response.json()) as {
        choices?: {
          message?: {
            content?: string | null;
          };
        }[];
      };

      const content = data.choices?.[0]?.message?.content;

      if (!content) return fallback;

      const parsed: unknown = JSON.parse(content);

      if (!isValidEstimate(parsed)) {
        console.warn("Groq returned an invalid prep estimate.");
        return fallback;
      }

      return {
        estimatedPrepMinutes: Math.max(
          input.minimumPrepTimeMin,
          parsed.estimated_prep_minutes,
        ),
        reason: parsed.reason.trim().slice(0, 500),
        source: "AI",
      };
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.error("AI prep-time estimation error:", error);
    return fallback;
  }
}