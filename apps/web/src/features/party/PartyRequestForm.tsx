import { useState } from "react";
import type { FormEvent } from "react";
import {
  CalendarDays,
  UsersRound,
  MapPin,
  LoaderCircle,
} from "lucide-react";

import type { CreatePartyRequestInput, PartyRequest } from "./party.types";
import { createPartyRequest } from "./partyService";

type GetToken = () => Promise<string | null>;

interface PartyRequestFormProps {
  outletId?: string;
  getToken: GetToken;
  onCreated: (request: PartyRequest) => void;
}

function getLocalDateTimeMin(): string {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

export default function PartyRequestForm({
  outletId,
  getToken,
  onCreated,
}: PartyRequestFormProps) {
  const [eventAt, setEventAt] = useState("");
  const [guestCount, setGuestCount] = useState(4);
  const [eventType, setEventType] = useState("Birthday");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [dietaryNotes, setDietaryNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const minEventDateTime = getLocalDateTimeMin();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!eventAt || new Date(eventAt).getTime() < Date.now() + 24 * 60 * 60 * 1000) {
      setError("Please select an event date and time at least 24 hours from now.");
      return;
    }

    if (guestCount < 2 || guestCount > 30) {
      setError("Guest count must be between 2 and 30.");
      return;
    }

    const input: CreatePartyRequestInput = {
      ...(outletId ? { outletId } : {}),
      eventAt: new Date(eventAt).toISOString(),
      guestCount,
      eventType: eventType || undefined,
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || undefined,
      area: area.trim(),
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      postalCode: postalCode.trim(),
      specialRequests: specialRequests.trim() || undefined,
      dietaryNotes: dietaryNotes.trim() || undefined,
    };

    try {
      setSubmitting(true);

      const request = await createPartyRequest(input, getToken);

      onCreated(request);

      setEventAt("");
      setGuestCount(4);
      setAddressLine1("");
      setAddressLine2("");
      setArea("");
      setCity("");
      setState("");
      setPostalCode("");
      setSpecialRequests("");
      setDietaryNotes("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your party request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-stone-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100 p-5 sm:p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
          <UsersRound size={25} />
        </div>

        <h2 className="mt-4 text-xl font-bold text-stone-900">
          Plan your party catering
        </h2>

        <p className="mt-2 text-sm leading-6 text-stone-600">
          Submit your event details. Our team will review your request
          and contact you with the next steps.
        </p>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/80 p-3 text-sm text-stone-700">
          <CalendarDays size={18} className="mt-0.5 shrink-0 text-orange-600" />
          <span>
            Requests must be submitted at least 24 hours before your
            event. Submission does not mean your booking is confirmed.
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Event date and time *</span>
          <input
            required
            type="datetime-local"
            min={minEventDateTime}
            value={eventAt}
            onChange={(event) => setEventAt(event.target.value)}
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Number of guests *</span>
          <input
            required
            type="number"
            min={2}
            max={30}
            value={guestCount}
            onChange={(event) => setGuestCount(Number(event.target.value))}
            className={inputClass}
          />
          <span className="mt-1 block text-xs text-stone-500">
            Between 2 and 30 guests
          </span>
        </label>

        <label className="sm:col-span-2">
          <span className={labelClass}>Event type</span>
          <select
            value={eventType}
            onChange={(event) => setEventType(event.target.value)}
            className={inputClass}
          >
            <option value="Birthday">Birthday</option>
            <option value="Office Event">Office event</option>
            <option value="Family Gathering">Family gathering</option>
            <option value="Wedding">Wedding</option>
            <option value="Anniversary">Anniversary</option>
            <option value="Other">Other</option>
          </select>
        </label>
      </div>

      <div className="border-t border-stone-200 pt-5">
        <div className="mb-4 flex items-center gap-2">
          <MapPin size={19} className="text-orange-600" />
          <h3 className="font-semibold text-stone-900">
            Event delivery address
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={labelClass}>Address line 1 *</span>
            <input
              required
              value={addressLine1}
              onChange={(event) => setAddressLine1(event.target.value)}
              placeholder="House / building, street"
              className={inputClass}
            />
          </label>

          <label className="sm:col-span-2">
            <span className={labelClass}>Address line 2</span>
            <input
              value={addressLine2}
              onChange={(event) => setAddressLine2(event.target.value)}
              placeholder="Landmark or additional details"
              className={inputClass}
            />
          </label>

          <label>
            <span className={labelClass}>Area *</span>
            <input
              required
              value={area}
              onChange={(event) => setArea(event.target.value)}
              className={inputClass}
            />
          </label>

          <label>
            <span className={labelClass}>Postal code *</span>
            <input
              required
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value)}
              className={inputClass}
            />
          </label>

          <label>
            <span className={labelClass}>City</span>
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className={inputClass}
            />
          </label>

          <label>
            <span className={labelClass}>State</span>
            <input
              value={state}
              onChange={(event) => setState(event.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </div>

      <div className="grid gap-4">
        <label>
          <span className={labelClass}>Dietary requirements</span>
          <textarea
            rows={3}
            value={dietaryNotes}
            onChange={(event) => setDietaryNotes(event.target.value)}
            placeholder="Vegetarian, vegan, allergies, etc."
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Special requests</span>
          <textarea
            rows={3}
            value={specialRequests}
            onChange={(event) => setSpecialRequests(event.target.value)}
            placeholder="Any additional event or catering details"
            className={inputClass}
          />
        </label>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3.5 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting && <LoaderCircle size={18} className="animate-spin" />}
        {submitting ? "Submitting request..." : "Submit party request"}
      </button>
    </form>
  );
}