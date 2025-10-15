import axios from "axios";
import config from "../../config";

 export async function filterByTravelTime(
  origin: [number, number], // [lat, lon]
  leads: any[],
  maxMinutes: number,
  mode: 'driving' | 'walking' | 'transit'
) {
  if (!leads.length) return [];

  console.log('Filtering leads based on travel time...', { origin, maxMinutes, mode });

  // Filter out leads without valid coordinates
  const validLeads = leads.filter(
    lead => lead.locationId?.latitude != null && lead.locationId?.longitude != null
  );

  if (!validLeads.length) return [];

  // Prepare destinations in "lat,lon" format
  const destinations = validLeads
    .map(lead => `${lead.locationId.latitude},${lead.locationId.longitude}`)
    .join('|');


  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
      params: {
        origins: `${origin[1]},${origin[0]}`, // latitude,longitude  --- reversed order of coordinates
        destinations,
        mode,
        departure_time: 'now',
        key: config.google_maps_api_key,
      },
    });

    console.log('Distance Matrix API response:', response.data);

    const elements = response.data.rows[0]?.elements || [];
    console.log('Distance Matrix API elements:', elements);

    // Map travel time/distance to leads
    const updatedLeads = validLeads
      .map((lead, i) => {
        const element = elements[i];
        if (!element || element.status !== 'OK') return null;

        return {
          ...lead,
          travelDuration: element.duration?.value, // seconds
          travelDistance: element.distance?.value, // meters
        };
      })
      .filter(Boolean)
      .filter(lead => lead!.travelDuration! <= maxMinutes * 60)
      .sort((a, b) => a!.travelDuration! - b!.travelDuration!);

    console.log('Leads after travel time filtering:', updatedLeads);

    return updatedLeads as any[];
  } catch (error) {
    console.error('Distance Matrix API error:', error);
    return [];
  }
}
