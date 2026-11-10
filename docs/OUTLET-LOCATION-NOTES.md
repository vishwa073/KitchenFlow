# KitchenFlow — Seeded Outlet and Map Testing Notes

This note is based on the outlet seed data in `apps/api/prisma/seed-data/oultets.ts` from the project snapshot.

## Madhapur outlet (recommended for role testing)

| Field | Seeded value |
|---|---|
| Outlet | KitchenFlow Madhapur |
| Outlet code | `HYD-MAD-004` |
| Area | Madhapur, Hyderabad, Telangana |
| PIN code | `500081` |
| Latitude | `17.441148` |
| Longitude | `78.391069` |
| Delivery radius | `3.0 km` |
| Minimum prep time | `20 minutes` |
| Cloud kitchen | No |

**Map pin for a straightforward serviceability test:** use the seeded outlet coordinates themselves:

```text
Latitude:  17.441148
Longitude: 78.391069
```

This is a safe deterministic test point because it matches the outlet's seeded coordinate (distance approximately zero). To test a point near, but not exactly at, the outlet, move the pin a short distance and re-run serviceability. The configured radius is 3.0 km; points beyond that radius should not be considered serviceable by this outlet, subject to the backend's distance calculation and any other active outlets nearby.

**Suggested manually entered delivery description:** `Madhapur, Hyderabad, Telangana – near KitchenFlow Madhapur (PIN 500081)`. This is a locality-level description, not a verified street address. The tester should replace it with a real test landmark/building description if needed.

## Other seeded Hyderabad outlets

Coordinates and delivery radii below are copied from the seed data. They are outlet reference points, not guaranteed customer addresses.

| Outlet | Code | Area / PIN | Latitude | Longitude | Radius |
|---|---|---|---:|---:|---:|
| KitchenFlow Kondapur | `HYD-KON-001` | Kondapur / 500084 | 17.462210 | 78.356849 | 3.0 km |
| KitchenFlow Gachibowli | `HYD-GAC-002` | Gachibowli / 500032 | 17.443620 | 78.351960 | 3.5 km |
| KitchenFlow Kukatpally | `HYD-KUK-003` | Kukatpally / 500072 | 17.491659 | 78.391983 | 3.5 km |
| KitchenFlow Madhapur | `HYD-MAD-004` | Madhapur / 500081 | 17.441148 | 78.391069 | 3.0 km |
| KitchenFlow HITEC City | `HYD-HIT-005` | HITEC City / 500081 | 17.443500 | 78.377200 | 2.5 km |
| KitchenFlow Miyapur | `HYD-MIY-006` | Miyapur / 500049 | 17.496800 | 78.356500 | 3.5 km |
| KitchenFlow Manikonda | `HYD-MAN-007` | Manikonda / 500089 | 17.405500 | 78.385800 | 3.5 km |
| KitchenFlow Jubilee Hills | `HYD-JUB-008` | Jubilee Hills / 500033 | 17.433400 | 78.411100 | 3.0 km |
| KitchenFlow Banjara Hills | `HYD-BAN-009` | Banjara Hills / 500034 | 17.416822 | 78.438392 | 3.0 km |
| KitchenFlow Ameerpet | `HYD-AME-010` | Ameerpet / 500016 | 17.447289 | 78.444995 | 3.0 km |
| KitchenFlow Secunderabad | `HYD-SEC-011` | Secunderabad / 500003 | 17.432000 | 78.487000 | 3.5 km |
| KitchenFlow Dilsukhnagar | `HYD-DIL-012` | Dilsukhnagar / 500060 | 17.368800 | 78.524700 | 3.5 km |
| KitchenFlow Uppal | `HYD-UPP-013` | Uppal / 500039 | 17.401000 | 78.559100 | 3.5 km |
| KitchenFlow Shamshabad | `HYD-SHA-014` | Shamshabad / 501218 | 17.251000 | 78.400000 | 4.5 km |

## How location selection works

- The frontend uses Leaflet/React Leaflet and OpenStreetMap raster tiles.
- A user can click the map to choose a point or request browser geolocation.
- The UI displays the selected latitude and longitude.
- The frontend sends the coordinates to the serviceability API.
- The backend computes distance from each active outlet and compares it with that outlet's `deliveryRadiusKm`.

## Important limitation: no address geocoding

The current map implementation does not call a reverse-geocoding service. It does not automatically resolve a selected pin into a street address, and it does not verify typed address text against an authoritative address database. The free-text address and the selected map coordinates are separate pieces of information.

For reliable evaluation:
1. Select the map pin near the outlet.
2. Run **Check delivery**.
3. Enter a descriptive delivery address manually in the address form.
4. Treat the serviceability result as based on the pin coordinates, not on the typed address string.
