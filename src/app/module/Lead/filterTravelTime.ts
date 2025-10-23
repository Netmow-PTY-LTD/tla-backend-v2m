import mongoose from 'mongoose';
import { LocationType } from '../UserLocationServiceMap/userLocationServiceMap.interface';
import ZipCode from '../Country/zipcode.model';

const MODE_SPEED: Record<string, number> = {
  driving: 40, // km/h
  bicycling: 15,
  walking: 5,
};

// Define a return type for clarity
interface TravelTimeResult {
  condition: {
    serviceId: { $in: mongoose.Types.ObjectId[] };
    locationId: { $in: mongoose.Types.ObjectId[] };
  } | null;
  nearbyZipIds: mongoose.Types.ObjectId[];
}

export const findLeadsWithinTravelTime = async (
  userProfile: any,
  userLocationService: any[],
  travelTimeServiceIds: mongoose.Types.ObjectId[],
): Promise<TravelTimeResult> => {
  if (!travelTimeServiceIds.length) {
    return { condition: null, nearbyZipIds: [] };
  }

  const travelTimeMappings = userLocationService.filter(
    (l) => l.locationType === LocationType.TRAVEL_TIME
  );

  let allNearbyZipIds: mongoose.Types.ObjectId[] = [];

  for (const loc of travelTimeMappings) {
    const locationGroup = loc.locationGroupId;
    if (!locationGroup?.location?.coordinates) continue;

    const [lng, lat] = locationGroup.location.coordinates;

    const travelMode = loc.travelmode || 'driving';
    const maxTravelTime =
      typeof loc.traveltime === 'number'
        ? loc.traveltime
        : Number(loc.traveltime) || 15;

    const speedKmPerHour = MODE_SPEED[travelMode] || 40;
    const maxDistanceMeters = (speedKmPerHour * maxTravelTime * 1000) / 60;

    const nearbyZips = await ZipCode.find({
      countryId: userProfile.country,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: maxDistanceMeters,
        },
      },
    }).select('_id');

    allNearbyZipIds.push(
      ...nearbyZips.map((z) =>
        typeof z._id === 'string' ? new mongoose.Types.ObjectId(z._id) : z._id
      )
    );
  }

  allNearbyZipIds = Array.from(
    new Set(allNearbyZipIds.map((id) => id.toString()))
  ).map((id) => new mongoose.Types.ObjectId(id));

  if (allNearbyZipIds.length > 0) {
    return {
      condition: {
        serviceId: { $in: travelTimeServiceIds },
        locationId: { $in: allNearbyZipIds },
      },
      nearbyZipIds: allNearbyZipIds,
    };
  }

  return { condition: null, nearbyZipIds: [] };
};
