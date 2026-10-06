import axios from 'axios';
import type { components, operations } from './api-types';

// Response and request types come from backend/openapi.json.
// Regenerate them with `npm run api:types` after the backend spec changes.
type Schemas = components['schemas'];
export type Listing = Schemas['Listing'];
export type ListingsResponse = Schemas['ListingsPage'];
export type Prediction = Schemas['Prediction'];
export type BatchPredictionResponse = Schemas['BatchPredictionResponse'];
export type ListingQuery = NonNullable<operations['listListings']['parameters']['query']>;

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getListings(params?: ListingQuery): Promise<ListingsResponse> {
  const response = await api.get<ListingsResponse>('/listings', { params });
  return response.data;
}

export async function getListingById(id: string): Promise<Listing> {
  const response = await api.get<Listing>(`/listings/${id}`);
  return response.data;
}

export async function getPrediction(listingId: string, interestRate?: number): Promise<Prediction> {
  const response = await api.get<Prediction>(`/predictions/listing/${listingId}`, {
    params: { interestRate },
  });
  return response.data;
}

export async function getBatchPredictions(
  listingIds: string[],
  interestRate?: number,
): Promise<BatchPredictionResponse> {
  const response = await api.post<BatchPredictionResponse>('/predictions/batch', {
    listingIds,
    interestRate,
  });
  return response.data;
}
