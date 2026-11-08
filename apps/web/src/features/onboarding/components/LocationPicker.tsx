
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  value?: Coordinates | null;
  onChange: (coordinates: Coordinates) => void;
}

const DEFAULT_POSITION: Coordinates = {
  latitude: 17.385,
  longitude: 78.4867,
};

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapClickHandler({
  onChange,
}: {
  onChange: (coordinates: Coordinates) => void;
}) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  return null;
}

function MapRecenter({ position }: { position: Coordinates }) {
  const map = useMap();

  useEffect(() => {
    map.setView(
      [position.latitude, position.longitude],
      Math.max(map.getZoom(), 15),
      { animate: true },
    );
  }, [map, position.latitude, position.longitude]);

  return null;
}

export default function LocationPicker({
  value,
  onChange,
}: LocationPickerProps) {
  const [position, setPosition] = useState<Coordinates>(
    value ?? DEFAULT_POSITION,
  );
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [hasSelectedLocation, setHasSelectedLocation] = useState(Boolean(value));

  useEffect(() => {
    if (value) {
      setPosition(value);
      setHasSelectedLocation(true);
    }
  }, [value]);

  function handleLocationChange(coordinates: Coordinates) {
    setPosition(coordinates);
    setHasSelectedLocation(true);
    setLocationError("");
    onChange(coordinates);
  }

  function useCurrentLocation() {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Your browser does not support location access.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (location) => {
        handleLocationChange({
          latitude: Number(location.coords.latitude.toFixed(6)),
          longitude: Number(location.coords.longitude.toFixed(6)),
        });

        setIsLocating(false);
      },
      (error) => {
        let message = "Unable to get your location. Select a point on the map.";

        if (error.code === error.PERMISSION_DENIED) {
          message =
            "Location permission was denied. Allow location access in your browser, or select a point on the map.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message =
            "Your current location is unavailable. Please select a point on the map.";
        } else if (error.code === error.TIMEOUT) {
          message =
            "Location request timed out. Try again or select a point on the map.";
        }

        setLocationError(message);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[#34383e]">
          Pin your delivery location
        </p>

        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={isLocating}
          className="rounded-lg border border-[#f47b38] px-3 py-2 text-sm font-semibold text-[#e96d2a] transition hover:bg-[#fff1e8] disabled:cursor-wait disabled:opacity-60"
        >
          {isLocating ? "Locating..." : "Use my location"}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#e5e1d9]">
        <MapContainer
          center={[position.latitude, position.longitude]}
          zoom={13}
          scrollWheelZoom
          style={{ height: "320px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onChange={handleLocationChange} />
          <MapRecenter position={position} />

          <Marker
            position={[position.latitude, position.longitude]}
            icon={markerIcon}
          />
        </MapContainer>
      </div>

      {locationError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {locationError}
        </p>
      )}

      <p className="text-xs text-[#777b82]">
        {hasSelectedLocation
          ? "Location pinned. You can click elsewhere on the map to adjust it."
          : "Choose your delivery location by clicking on the map or using your current location."}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-[#f8f6f2] p-3">
          <p className="text-xs text-[#777b82]">Latitude</p>
          <p className="text-sm font-semibold text-[#34383e]">
            {position.latitude}
          </p>
        </div>

        <div className="rounded-lg bg-[#f8f6f2] p-3">
          <p className="text-xs text-[#777b82]">Longitude</p>
          <p className="text-sm font-semibold text-[#34383e]">
            {position.longitude}
          </p>
        </div>
      </div>
    </div>
  );
}
