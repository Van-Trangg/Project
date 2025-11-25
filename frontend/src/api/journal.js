import { api } from './apiClient';

// API functions for journal operations
export const listJournals = () => api.get('/journal');

export const listJournalsByPOI = (mapId) => {
  const params = mapId ? { map_id: mapId } : {};
  return api.get('/journal/by-poi/', { params });
};

export const listMyJournals = (poiId) => {
  const params = poiId ? { poi_id: poiId } : {};
  return api.get('/journal/my', { params });
};

export const createJournal = (payload) => 
  api.post('/journal', payload);

export const updateJournal = (journalId, payload) => 
  api.patch(`/journal/${journalId}`, payload);

export const getJournal = (journalId) => 
  api.get(`/journal/${journalId}`);

export const deleteJournal = (journalId) => 
  api.delete(`/journal/${journalId}`);

export const getPoiJournals = (poiId) => {
  const params = { poi_id: poiId };
  return api.get('/journal/poi/journals', { params });
};