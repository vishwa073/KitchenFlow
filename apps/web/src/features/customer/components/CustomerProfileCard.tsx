import { MapPin, Pencil, UserRound } from "lucide-react";

type CustomerAddress = {
  id: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  area: string;
  city: string;
  state: string;
  postalCode: string;
};

type CustomerProfileCardProps = {
  address: CustomerAddress | null;
  loading: boolean;
  onEditAddress: () => void;
};

export default function CustomerProfileCard({
  address,
  loading,
  onEditAddress,
}: CustomerProfileCardProps) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
          <UserRound size={24} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-stone-900">
            {address?.recipientName ?? "Customer"}
          </h2>
          <p className="text-sm text-stone-500">KitchenFlow account</p>
        </div>
      </div>

      <div className="my-5 border-t border-stone-100" />

      <div className="flex items-start gap-3">
        <MapPin size={20} className="mt-1 shrink-0 text-orange-600" />

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-stone-900">Delivery address</h3>

          {loading ? (
            <p className="mt-2 text-sm text-stone-500">
              Loading your address...
            </p>
          ) : address ? (
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {address.addressLine1}
              {address.addressLine2 && `, ${address.addressLine2}`}
              {address.landmark && `, ${address.landmark}`}
              {`, ${address.area}, ${address.city}, ${address.state} - ${address.postalCode}`}
            </p>
          ) : (
            <p className="mt-2 text-sm text-stone-500">
              No saved delivery address.
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onEditAddress}
        disabled={loading || !address}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 px-4 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Pencil size={16} />
        Change address
      </button>
    </section>
  );
}