import type { FormEvent } from "react";
import type { CreateOutletInput } from "../services/AdminService";

type CreateOutletDialogProps = {
  open: boolean;
  form: CreateOutletInput;
  saving: boolean;
  onChange: (field: keyof CreateOutletInput, value: string | boolean) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const fields: {
  name: keyof CreateOutletInput;
  label: string;
  placeholder?: string;
  required?: boolean;
}[] = [
  {
    name: "name",
    label: "Outlet name",
    placeholder: "e.g. KitchenFlow Indiranagar",
    required: true,
  },
  {
    name: "code",
    label: "Outlet code",
    placeholder: "e.g. BLR-01",
    required: true,
  },
  {
    name: "cityId",
    label: "City ID",
    placeholder: "Existing active City ID",
    required: true,
  },
  {
    name: "address",
    label: "Address",
    placeholder: "Street address",
    required: true,
  },
  {
    name: "area",
    label: "Area",
    placeholder: "e.g. Indiranagar",
    required: true,
  },
  {
    name: "postalCode",
    label: "Postal code",
    placeholder: "e.g. 560038",
    required: true,
  },
  {
    name: "phone",
    label: "Phone",
    placeholder: "Phone number (optional)",
  },
];

export default function CreateOutletDialog({
  open,
  form,
  saving,
  onChange,
  onClose,
  onSubmit,
}: CreateOutletDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-5 md:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Create new outlet
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add an outlet to the KitchenFlow platform.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close dialog"
            className="rounded-lg px-3 py-1 text-xl text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid gap-4 p-5 sm:grid-cols-2 md:p-6">
            {fields.map((field) => (
              <label
                key={field.name}
                className="block text-sm font-medium text-slate-700"
              >
                {field.label}

                <input
                  required={field.required}
                  value={String(form[field.name] ?? "")}
                  onChange={(event) =>
                    onChange(field.name, event.target.value)
                  }
                  placeholder={field.placeholder}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </label>
            ))}

            <label className="flex items-center gap-3 self-end rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.isCloudKitchen}
                onChange={(event) =>
                  onChange("isCloudKitchen", event.target.checked)
                }
                className="h-4 w-4 accent-orange-600"
              />

              Cloud kitchen
            </label>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 md:px-6">
            <p className="mb-4 text-xs leading-5 text-slate-500">
              The current API requires an active city's ID. There is no
              city-list endpoint in the current management route, so enter
              an existing valid City ID.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create outlet"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}