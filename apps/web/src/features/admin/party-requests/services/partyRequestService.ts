
const API_URL = import.meta.env.VITE_API_URL ?? "";

export type PartyRequestStatus =
  | "PENDING"
  | "REVIEWING"
  | "QUOTED"
  | "CONFIRMED"
  | "REJECTED";

export type PartyRequest = {
  id: string;
  status: PartyRequestStatus;
  eventDate?: string | null;
  eventTime?: string | null;
  guestCount?: number | null;
  quoteAmount?: number | string | null;
  managerNotes?: string | null;
  quotedAt?: string | null;

  customer?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;

  outlet?: {
    id: string;
    name: string;
    code?: string | null;
  } | null;

  manager?: {
    id?: string;
    name?: string | null;
  } | null;

  [key: string]: unknown;
};

type PartyRequestsResponse = {
  success: boolean;
  count: number;
  requests: PartyRequest[];
};

type UpdatePartyRequestInput = {
  status: "REVIEWING" | "QUOTED" | "CONFIRMED" | "REJECTED";
  quoteAmount?: number;
  managerNotes?: string;
};

type UpdatePartyRequestResponse = {
  success: boolean;
  request: PartyRequest;
};

async function request<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ??
        result?.error ??
        `Request failed with status ${response.status}`
    );
  }

  return result as T;
}

export const partyRequestService = {
  async getAll(token: string) {
    const result = await request<PartyRequestsResponse>(
      "/api/management/party-requests",
      token
    );

    return result.requests;
  },

  async update(
    id: string,
    input: UpdatePartyRequestInput,
    token: string
  ) {
    const result = await request<UpdatePartyRequestResponse>(
      `/api/management/party-requests/${id}`,
      token,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    );

    return result.request;
  },
};
