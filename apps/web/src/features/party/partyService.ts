import type {
  CreatePartyRequestInput,
  PartyRequest,
} from "./party.types";

type GetToken = () => Promise<string | null>;
type RawObject = Record<string, unknown>;

function asObject(value: unknown): RawObject {
  return value && typeof value === "object"
    ? (value as RawObject)
    : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

async function authenticatedFetch(
  path: string,
  getToken: GetToken,
  options: RequestInit = {},
): Promise<unknown> {
  const token = await getToken();

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) {
    throw new Error("VITE_API_URL is not configured.");
  }

  const response = await fetch(`${apiUrl}/api${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result = asObject(await response.json());

  if (!response.ok) {
    throw new Error(
      asString(result.message, "Unable to process your party request."),
    );
  }

  return result;
}

export async function createPartyRequest(
  input: CreatePartyRequestInput,
  getToken: GetToken,
): Promise<PartyRequest> {
  const result = asObject(
    await authenticatedFetch("/party", getToken, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  );

  const partyRequest = asObject(result.partyRequest);

  if (!partyRequest.id) {
    throw new Error("The server did not return the party request.");
  }

  return partyRequest as unknown as PartyRequest;
}

export async function getPartyRequests(
  getToken: GetToken,
): Promise<PartyRequest[]> {
  const result = asObject(await authenticatedFetch("/party", getToken));

  return Array.isArray(result.partyRequests)
    ? (result.partyRequests as PartyRequest[])
    : [];
}

export async function getPartyRequestById(
  id: string,
  getToken: GetToken,
): Promise<PartyRequest | null> {
  const result = asObject(
    await authenticatedFetch(
      `/party/${encodeURIComponent(id)}`,
      getToken,
    ),
  );

  return result.partyRequest
    ? (result.partyRequest as PartyRequest)
    : null;
}