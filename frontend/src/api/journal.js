import { api } from './apiClient';

// API functions for journal operations
export const listJournals = () => api.get('/journal');

export const listJournalsByPOI = () => api.get('/journal/by-poi/');

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