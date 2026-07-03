import React, { useEffect, useState, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getListings } from '../services/api';
import '../styles/Map.css';

interface Listing {
  id: string;
  address: string;
  city: string;
  list_price: number;
  beds: number;
  baths: number;
  latitude: number;
  longitude: number;
}

export function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize map
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/positron',
      center: [-95.7129, 37.0902], // Center of USA
      zoom: 4,
    });

    // Load listings
    const loadListings = async () => {
      try {
        const data = await getListings({ limit: 100 });
        setListings(data.data);

        // Add markers
        data.data.forEach((listing: Listing) => {
          if (map.current) {
            const el = document.createElement('div');
            el.className = 'marker';
            el.innerHTML = `<div class="marker-price">$${(listing.list_price / 1000).toFixed(0)}k</div>`;

            const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
              `<div class="popup-content">
                <p class="popup-address">${listing.address}</p>
                <p class="popup-details">${listing.beds}bd ${listing.baths}ba</p>
                <p class="popup-price">$${listing.list_price.toLocaleString()}</p>
              </div>`
            );

            new maplibregl.Marker(el)
              .setLngLat([listing.longitude, listing.latitude])
              .setPopup(popup)
              .addTo(map.current);
          }
        });
      } catch (error) {
        console.error('Error loading listings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadListings();

    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className="map-wrapper">
      {loading && <div className="loading">Loading listings...</div>}
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
