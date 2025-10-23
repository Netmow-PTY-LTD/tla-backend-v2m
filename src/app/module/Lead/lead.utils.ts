import axios from "axios";
import config from "../../config";
import mongoose from "mongoose";
import ZipCode from "../Country/zipcode.model";



// export function filterByDistanceKm(
//   origin: [number, number], // [lng, lat]
//   leads: any[],
//   maxDistanceKm: number
// ) {
//   if (!leads?.length) return [];

//   const [originLng, originLat] = origin;
//   const R = 6371; // Earth radius in km

//   // Function to calculate distance between two coordinates
//   const getDistanceKm = (coord1: [number, number], coord2: [number, number]) => {
//     const [lon1, lat1] = coord1;
//     const [lon2, lat2] = coord2;
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a =
//       Math.sin(dLat / 2) ** 2 +
//       Math.cos(lat1 * Math.PI / 180) *
//       Math.cos(lat2 * Math.PI / 180) *
//       Math.sin(dLon / 2) ** 2;
//     return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
//   };

//   // ✅ Calculate distance for each lead
//   const enrichedLeads = leads.map((lead) => {
//     const { latitude, longitude } = lead.locationId;
//     const distanceKm = getDistanceKm([originLng, originLat], [longitude, latitude]);




//    const result= {
//       ...(lead.toObject ? lead.toObject() : lead),
//       distanceInfo: {
//         distanceText: `${distanceKm.toFixed(2)} km`,
//         distanceValue: distanceKm,
//         calculatedAt: new Date().toISOString(),
//       },
//     };

//     console.log('result', result);
//      return result;
//   });

//   //  Filter leads within maxDistanceKm
//   const filteredLeads = enrichedLeads.filter(l => l.distanceInfo.distanceValue <= maxDistanceKm);

//   //  Optional debug info
//   // console.log(`Total leads: ${enrichedLeads.length}, Within ${maxDistanceKm} km: ${filteredLeads.length}`);

//   return filteredLeads;
// }















// ------------------ Module-level in-memory cache ------------------
interface CachedZip {
  _id: mongoose.Types.ObjectId;
  location: { coordinates: number[] };
}

const zipCache: Record<string, CachedZip[]> = {};
const zipCacheTimestamps: Record<string, number> = {};
const ZIP_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function getZipsByCountry(countryId: string): Promise<CachedZip[]> {
  const now = Date.now();
  const cacheExpired = !zipCacheTimestamps[countryId] || now - zipCacheTimestamps[countryId] > ZIP_CACHE_TTL;

  if (!zipCache[countryId] || cacheExpired) {
    console.log(`Fetching zips for country ${countryId} from DB...`);
    const zips = await ZipCode.find({ countryId }).select('location');
    zipCache[countryId] = zips
      .filter(z => z.location && Array.isArray(z.location.coordinates))
      .map(z => ({
        _id: new mongoose.Types.ObjectId(z._id),
        location: { coordinates: z.location?.coordinates ?? [] }
      }));
    zipCacheTimestamps[countryId] = now;
  } else {
    console.log(`Using cached zips for country ${countryId}`);
  }

  return zipCache[countryId];
}










// Batch travel info for multiple destinations

// Simple in-memory cache
const travelCache = new Map<string, { distanceMeters: number; durationSeconds: number }>();


export const getBatchTravelInfo = async (
  origin: { lat: number; lng: number },
  destinations: { lat?: number; lng?: number; zipCodeId?: string }[],
  mode = 'driving',
  batchSize = 25 // Google Distance Matrix limit
) => {
  const results: any[] = [];

  for (let i = 0; i < destinations.length; i += batchSize) {
    const batch = destinations.slice(i, i + batchSize);

    // Prepare keys for caching
    const cacheKeys = batch.map(
      d => `${origin.lat},${origin.lng}_${d.lat},${d.lng}_${mode}`
    );

    // Check cache first
    const cachedResults = batch.map((d, idx) => {
      const key = cacheKeys[idx];
      if (travelCache.has(key)) {
        return { ...travelCache.get(key), zipCodeId: d.zipCodeId };
      }
      return null;
    });

    // Destinations not in cache
    const toFetch = batch.filter((_, idx) => !cachedResults[idx]);

    if (toFetch.length > 0) {
      const destinationStr = toFetch.map(d => `${d.lat},${d.lng}`).join('|');

      try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
          params: {
            origins: `${origin.lat},${origin.lng}`,
            destinations: destinationStr,
            mode,
            key: config.google_maps_api_key,
          },
          timeout: 15000,
        });

        if (response.data.rows?.[0]?.elements) {
          response.data.rows[0].elements.forEach((el: any, idx: number) => {
            if (el.status === 'OK') {
              const key = `${origin.lat},${origin.lng}_${toFetch[idx].lat},${toFetch[idx].lng}_${mode}`;
              const res = {
                zipCodeId: toFetch[idx].zipCodeId,
                distanceMeters: el.distance.value,
                durationSeconds: el.duration.value,
              };
              results.push(res);
              // Save to cache
              travelCache.set(key, { distanceMeters: el.distance.value, durationSeconds: el.duration.value });
            }
          });
        }
      } catch (err: any) {
        console.error('Distance Matrix API error:', err.message);
      }
    }

    // Add cached results
    cachedResults.forEach(cr => {
      if (cr) results.push(cr);
    });
  }

  return results;
};
