import React, { useState, useEffect } from 'react';
import { Map } from '../components/Map';
import { SearchFilters, SearchParams } from '../components/SearchFilters';
import { getListings, getPrediction } from '../services/api';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [listings, setListings] = useState<any[]>([]);
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [prediction, setPrediction] = useState<any | null>(null);
  const [interestRate, setInterestRate] = useState(6.8);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (filters: SearchParams) => {
    setLoading(true);
    try {
      const response = await getListings(filters);
      setListings(response.data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectListing = async (listing: any) => {
    setSelectedListing(listing);
    setLoading(true);
    try {
      const pred = await getPrediction(listing.id, interestRate);
      setPrediction(pred);
    } catch (error) {
      console.error('Error fetching prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestRateChange = async (rate: number) => {
    setInterestRate(rate);
    if (selectedListing) {
      setLoading(true);
      try {
        const pred = await getPrediction(selectedListing.id, rate);
        setPrediction(pred);
      } catch (error) {
        console.error('Error fetching prediction:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>MLS Price Predictions</h2>
        <SearchFilters onSearch={handleSearch} />
      </div>

      <div className="dashboard-content">
        <div className="map-section">
          <Map />
        </div>

        <div className="details-panel">
          {selectedListing ? (
            <>
              <div className="listing-details">
                <h3>{selectedListing.address}</h3>
                <p className="location">{selectedListing.city}, {selectedListing.state} {selectedListing.zip_code}</p>
                
                <div className="property-info">
                  <div className="info-item">
                    <span className="label">Bedrooms</span>
                    <span className="value">{selectedListing.beds}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Bathrooms</span>
                    <span className="value">{selectedListing.baths}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Sq Ft</span>
                    <span className="value">{selectedListing.sqft?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="price-section">
                  <div className="price-item">
                    <span className="label">List Price</span>
                    <span className="price">${selectedListing.list_price.toLocaleString()}</span>
                  </div>
                  {prediction && (
                    <div className="price-item prediction">
                      <span className="label">Predicted Price</span>
                      <span className="price">${prediction.predicted_price.toLocaleString()}</span>
                      <span className="confidence">Confidence: {(prediction.confidence * 100).toFixed(0)}%</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="interest-rate-control">
                <label>Interest Rate: {interestRate.toFixed(2)}%</label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => handleInterestRateChange(Number(e.target.value))}
                />
                <div className="rate-labels">
                  <span>3%</span>
                  <span>10%</span>
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>Select a listing to view details and price prediction</p>
            </div>
          )}
        </div>
      </div>

      {loading && <div className="loading-overlay">Loading...</div>}
    </div>
  );
}
