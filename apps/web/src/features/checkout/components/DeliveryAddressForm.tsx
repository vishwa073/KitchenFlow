
interface SavedAddress {
  id: string;
  label?: string | null;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  area: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface DeliveryAddressFormProps {
  addresses: SavedAddress[];
  selectedAddressId: string;
  setSelectedAddressId: (value: string) => void;
  isLoadingAddresses: boolean;
}

export default function DeliveryAddressForm({
  addresses,
  selectedAddressId,
  setSelectedAddressId,
  isLoadingAddresses,
}: DeliveryAddressFormProps) {
  const selectedAddress = addresses.find(
    (address) => address.id === selectedAddressId,
  );

  return (
    <section className="rounded-2xl border bg-white p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Delivery address
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Select where your order should be delivered.
        </p>
      </div>

      {isLoadingAddresses ? (
        <p className="text-sm text-gray-500">
          Loading your saved addresses...
        </p>
      ) : addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed p-4">
          <p className="text-sm font-medium text-gray-800">
            No saved addresses found.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Please add an address from your account before placing an order.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {addresses.map((address) => {
              const isSelected = address.id === selectedAddressId;

              return (
                <label
                  key={address.id}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                    isSelected
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryAddress"
                    value={address.id}
                    checked={isSelected}
                    onChange={() => setSelectedAddressId(address.id)}
                    className="mt-1 accent-orange-600"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {address.label || "Saved address"}
                      </span>

                      {address.isDefault && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          Default
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-gray-800">
                      {address.recipientName} · {address.phone}
                    </p>

                    <p className="mt-1 text-sm leading-5 text-gray-600">
                      {address.addressLine1}
                      {address.addressLine2
                        ? `, ${address.addressLine2}`
                        : ""}
                      {address.landmark ? `, ${address.landmark}` : ""}
                      {`, ${address.area}, ${address.city}, ${address.state} - ${address.postalCode}, ${address.country}`}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          {selectedAddress && (
            <p className="mt-4 text-xs text-gray-500">
              Delivering to {selectedAddress.recipientName}.
            </p>
          )}
        </>
      )}
    </section>
  );
}
