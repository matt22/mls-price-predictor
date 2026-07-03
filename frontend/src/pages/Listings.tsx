import React, { useState, useEffect } from 'react';
import { getListings, getPrediction } from '../services/api';
import { SearchFilters, SearchParams } from '../components/SearchFilters';
import '../styles/Listings.css';

export default function Listings() {
  const [listings, setListings] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const handleSearch = async (filters: SearchParams) => {
    setPage(1);
    setLoading(true);
    try {
      const response = await getListings({ ...filters, page: 1 });
      setListings(response.data);
      setPredictions(new Map());
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadPrediction = async (listingId: string) => {
    if (predictions.has(listingId)) return;

    try {
      const pred = await getPrediction(listingId);
      setPredictions(new Map(predictions).set(listingId, pred));
    } catch (error) {
      console.error('Error fetching prediction:', error);
    }
  };

  useEffect(() => {
    handleSearch({});
  }, []);

  return (
    <div className="listings-page">
      <div className="listings-header">
        <h2>MLS Listings</h2>
        <SearchFilters onSearch={handleSearch} />
      </div>

      <div className="listings-grid">
        {listings.map((listing) => {
          const prediction = predictions.get(listing.id);
          return (
            <div key={listing.id} className="listing-card">
              <div className="listing-image">
                <div className="image-placeholder">{listing.beds}bd • {listing.baths}ba</div>
              </div>

              <div className="listing-info">
                <h3>{listing.address}</h3>
                <p className="location">{listing.city}, {listing.state}</p>

                <div className="listing-meta">
                  <span>{listing.beds} Beds</span>
                  <span>{listing.baths} Baths</span>
                  {listing.sqft && <span>{(listing.sqft / 1000).toFixed(1)}k Sq Ft</span>}
                </div>

                <div className="listing-prices">
                  <div className="price-row">
                    <span>List Price:</span>
                    <span className="price">${listing.list_price.toLocaleString()}</span>
                  </div>
                  {prediction && (
                    <div className="price-row prediction">
                      <span>Predicted:</span>
                      <span className="price">${prediction.predicted_price.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {!prediction && (
                  <button
                    className="predict-button"
                    onClick={() => handleLoadPrediction(listing.id)}
                  >
                    Get Prediction
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {listings.length === 0 && !loading && (
        <div className="no-listings">
          <p>No listings found. Try adjusting your filters.</p>
        </div>
      )}

      {loading && <div className="loading-overlay">Loading...</div>}
    </div>
  );
}
