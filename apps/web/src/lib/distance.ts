const EARTH_RADIUS_KM = 6371;

export function calculateDistanceKm(
  originLat: number,
  originLng: number,
  destinationLat: number,
  destinationLng: number
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const latDifference = toRadians(destinationLat - originLat);
  const lngDifference = toRadians(destinationLng - originLng);

  const a =
    Math.sin(latDifference / 2) ** 2 +
    Math.cos(toRadians(originLat)) *
      Math.cos(toRadians(destinationLat)) *
      Math.sin(lngDifference / 2) ** 2;

  const centralAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * centralAngle;
}