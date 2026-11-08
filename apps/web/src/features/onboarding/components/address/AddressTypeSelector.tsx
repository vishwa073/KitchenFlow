import type { DeliveryAddress } from "../AddressForm";

interface AddressTypeSelectorProps {
  value: DeliveryAddress["addressType"];
  onChange: (value: DeliveryAddress["addressType"]) => void;
}

const addressTypes: DeliveryAddress["addressType"][] = [
  "HOME",
  "WORK",
  "OTHER",
];

export default function AddressTypeSelector({
  value,
  onChange,
}: AddressTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Address type
      </label>

      <div className="flex gap-3">
        {addressTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium
              transition ${
                value === type
                  ? "border-orange-500 bg-orange-50 text-orange-600"
                  : "border-gray-300 text-gray-600 hover:border-orange-300"
              }`}
          >
            {type.charAt(0) + type.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
    </div>
  );
}