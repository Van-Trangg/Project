import { api } from './apiClient'

export const listPlaces = () => api.get('/map/map/list')  
export const getProgress = () => api.get('/home/')
export const getPois = (mapId) => {
  return api.get(`/map/map/${mapId}/pois`)
}

export const getNearestMap = (lat, lng) =>
  api.get('/map/map/nearest', { params: { lat, lng } })

export const checkin = (payload) => api.post('map/map/checkin', payload)

export const confirmVehicle = (checkinId, vehicle) =>
  api.post(`map/map/checkin/${checkinId}/vehicle`, { vehicle_type: vehicle })

export const checked = (poi_id) => {
  return api.get(`map/map/poi/${poi_id}/checked`)
}

export const percentageChecked = (poi_id) => {
  return api.get(`map/map/poi/${poi_id}/checked/percent`)
}

export const sendMessage = (message) => {
  return api.post('/ai/ai/chat', { message: message });
};

export const resetChat = () => {
  return api.post('/ai/ai/reset');
};

export const getStats = () => {
  return api.get('/statistic/statistic/monthly/all');
};

// api/map.js or wherever your API functions are
export const getAllPois = async () => {
  try {
    // 1. Get all maps first
    const mapsResponse = await listPlaces();
    const maps = mapsResponse.data;

    // 2. Fetch POIs for every map in parallel (fast!)
    const poisPromises = maps.map(map => 
      getPois(map.id).then(res => res.data || [])
    );

    // 3. Wait for all requests to finish
    const allPoisArrays = await Promise.all(poisPromises);

    // 4. Flatten + concatenate into one big array
    const allPois = allPoisArrays.flat();

    // Optional: Add map info to each POI so you know where it belongs
    const allPoisWithMap = allPoisArrays.flatMap((pois, index) => 
      pois.map(poi => ({
        ...poi,
        mapId: maps[index].id,
        mapName: maps[index].name,
      }))
    );

    return allPoisWithMap; // or just `allPois` if you don't need map info
  } catch (error) {
    console.error('Failed to load all POIs:', error);
    return [];
  }
};