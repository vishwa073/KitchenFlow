
import { env } from "../../config/env.js";

type WahaSendTextResponse = {
  id?: string;
  [key: string]: unknown;
};

/**
 * Sends a WhatsApp message through the local WAHA session.
 * `phone` must include the country code, e.g. +919876543210.
 */
export async function sendWhatsAppMessage(
  phone: string,
  text: string,
): Promise<WahaSendTextResponse> {
  const normalizedPhone = phone.replace(/\D/g, "");

  if (normalizedPhone.length < 8 || normalizedPhone.length > 15) {
    throw new Error("Invalid WhatsApp phone number");
  }

  const response = await fetch(`${env.WAHA_BASE_URL}/api/sendText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": env.WAHA_API_KEY,
    },
    body: JSON.stringify({
      session: "default",
      chatId: `${normalizedPhone}@c.us`,
      text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `WAHA message failed (${response.status}): ${errorText}`,
    );
  }

  return (await response.json()) as WahaSendTextResponse;
}
