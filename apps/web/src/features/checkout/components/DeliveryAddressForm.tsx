interface DeliveryAddressFormProps {
  customerName: string;
  setCustomerName: (value: string) => void;

  phone: string;
  setPhone: (value: string) => void;

  address: string;
  setAddress: (value: string) => void;

  landmark: string;
  setLandmark: (value: string) => void;
}

export default function DeliveryAddressForm({
  customerName,
  setCustomerName,
  phone,
  setPhone,
  address,
  setAddress,
  landmark,
  setLandmark,
}: DeliveryAddressFormProps) {
  return (
    <section className="rounded-2xl border bg-white p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Delivery address
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Where should we deliver your order?
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Full name
          </label>
          <input
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Enter your full name"
            autoComplete="name"
            className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Phone number
          </label>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="10-digit mobile number"
            inputMode="numeric"
            maxLength={10}
            autoComplete="tel"
            className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-orange-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Complete address
          </label>
          <textarea
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="House/flat number, street, area"
            rows={3}
            autoComplete="street-address"
            className="w-full resize-none rounded-lg border px-3 py-2.5 outline-none focus:border-orange-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Landmark (optional)
          </label>
          <input
            value={landmark}
            onChange={(event) => setLandmark(event.target.value)}
            placeholder="Nearby landmark"
            className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-orange-500"
          />
        </div>
      </div>
    </section>
  );
}