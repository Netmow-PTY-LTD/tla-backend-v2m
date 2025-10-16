import axios from "axios";
import config from "../../config";

//  export async function filterByTravelTime(
//   origin: [number, number], // [lat, lon]
//   leads: any[],
//   maxMinutes: number,
//   mode: 'driving' | 'walking' | 'transit'
// ) {
//   if (!leads.length) return [];

//   console.log('Filtering leads based on travel time...', { origin, maxMinutes, mode });

//   // Filter out leads without valid coordinates
//   const validLeads = leads.filter(
//     lead => lead.locationId?.latitude != null && lead.locationId?.longitude != null
//   );

//   if (!validLeads.length) return [];

//   // Prepare destinations in "lat,lon" format
//   const destinations = validLeads
//     .map(lead => `${lead.locationId.latitude},${lead.locationId.longitude}`)
//     .join('|');


//   try {
//     const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
//       params: {
//         origins: `${origin[1]},${origin[0]}`, // latitude,longitude  --- reversed order of coordinates
//         destinations,
//         mode,
//         departure_time: 'now',
//         key: config.google_maps_api_key,
//       },
//     });

//     console.log('Distance Matrix API response:', response.data);

//     const elements = response.data.rows[0]?.elements || [];
//     console.log('Distance Matrix API elements:', elements);

//     // Map travel time/distance to leads
//     const updatedLeads = validLeads
//       .map((lead, i) => {
//         const element = elements[i];
//         if (!element || element.status !== 'OK') return null;

//         return {
//           ...lead,
//           travelDuration: element.duration?.value, // seconds
//           travelDistance: element.distance?.value, // meters
//         };
//       })
//       .filter(Boolean)
//       .filter(lead => lead!.travelDuration! <= maxMinutes * 60)
//       .sort((a, b) => a!.travelDuration! - b!.travelDuration!);

//     console.log('Leads after travel time filtering:', updatedLeads);

//     return updatedLeads as any[];
//   } catch (error) {
//     console.error('Distance Matrix API error:', error);
//     return [];
//   }
// }






export async function filterByTravelTime(
  origin: [number, number], // [lat, lon]
  leads: any[],
  maxMinutes: number,
  mode: 'driving' | 'walking' | 'transit' = 'driving',
) {
  if (!leads?.length) return [];

  const destinations = leads
    .map((lead) => `${lead.locationId.latitude},${lead.locationId.longitude}`)
    .join('|');

  const originStr = `${origin[1]},${origin[0]}`; // Google expects lat,lng

  const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
    params: {
      origins: originStr,
      destinations,
      mode,
      departure_time: 'now',
      key: config.google_maps_api_key,
    },
  });

  const elements = response.data?.rows?.[0]?.elements || [];

  // ✅ Merge travel data into each lead
  const mergedLeads = leads.map((lead, idx) => {
    const result = elements[idx];
    if (!result || result.status !== 'OK') return null;

    const durationValue = result.duration_in_traffic?.value || result.duration?.value || 0; // seconds
    const durationMinutes = durationValue / 60;

    return {
      ...(lead.toObject ? lead.toObject() : lead),
      travelInfo: {
        distanceText: result.distance?.text,
        distanceValue: result.distance?.value,
        durationText: result.duration_in_traffic?.text || result.duration?.text,
        durationValue,
        durationInTrafficText: result.duration_in_traffic?.text,
        durationInTrafficValue: result.duration_in_traffic?.value,
        calculatedAt: new Date().toISOString(),
        mode,
      },
      durationMinutes,
    };
  }).filter(Boolean);

  console.log('Merged leads with travel info:', mergedLeads);


  // ✅ Filter only leads within allowed travel time
  const filteredLeads = mergedLeads.filter((lead) => lead.durationMinutes <= maxMinutes);

  // ✅ (Optional) Debug logging
  console.log(`Total leads: ${mergedLeads.length}, Within ${maxMinutes} min: ${filteredLeads.length}`);

  return filteredLeads;
}





export function filterByDistanceKm(
  origin: [number, number], // [lng, lat]
  leads: any[],
  maxDistanceKm: number
) {
  if (!leads?.length) return [];

  const [originLng, originLat] = origin;
  const R = 6371; // Earth radius in km

  // Function to calculate distance between two coordinates
  const getDistanceKm = (coord1: [number, number], coord2: [number, number]) => {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  // ✅ Calculate distance for each lead
  const enrichedLeads = leads.map((lead) => {
    const { latitude, longitude } = lead.locationId;
    const distanceKm = getDistanceKm([originLng, originLat], [longitude, latitude]);

    return {
      ...(lead.toObject ? lead.toObject() : lead),
      distanceInfo: {
        distanceText: `${distanceKm.toFixed(2)} km`,
        distanceValue: distanceKm,
        calculatedAt: new Date().toISOString(),
      },
    };
  });

  // ✅ Filter leads within maxDistanceKm
  const filteredLeads = enrichedLeads.filter(l => l.distanceInfo.distanceValue <= maxDistanceKm);

  // ✅ Optional debug info
  console.log(`Total leads: ${enrichedLeads.length}, Within ${maxDistanceKm} km: ${filteredLeads.length}`);

  return filteredLeads;
}

