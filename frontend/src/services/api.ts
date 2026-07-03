import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ListingsResponse {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export async function getListings(params?: Record<string, any>): Promise<ListingsResponse> {
  const response = await api.get('/listings', { params });
  return response.data;
}

export async function getListingById(id: string) {
  const response = await api.get(`/listings/${id}`);
  return response.data;
}

export async function getPrediction(listingId: string, interestRate?: number) {
  const response = await api.get(`/predictions/listing/${listingId}`, {
    params: { interestRate },
  });
  return response.data;
}

export async function getBatchPredictions(listingIds: string[], interestRate?: number) {
  const response = await api.post('/predictions/batch', {
    listingIds,
    interestRate,
  });
  return response.data;
}
