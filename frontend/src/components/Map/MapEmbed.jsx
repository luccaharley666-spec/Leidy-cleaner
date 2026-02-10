import React from 'react';

// MapEmbed: if [REDACTED_TOKEN] provided, uses Google Maps embed with address, otherwise shows a Leaflet static map fallback.
function MapEmbed({ address, lat, lng, zoom = 14, height = 300 }) {
  const key = process.env.[REDACTED_TOKEN];

  if (key && address) {
    const src = `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(address)}`;
    return (
      <div className="rounded overflow-hidden border">
        <iframe title="map" width="100%" height={height} frameBorder="0" src={src} allowFullScreen></iframe>
      </div>
    );
  }

  // fallback: simple OpenStreetMap iframe centered on coords or Brazil
  const latF = lat || -23.55052;
  const lngF = lng || -46.633308;
  const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lngF-0.05}%2C${latF-0.03}%2C${lngF+0.05}%2C${latF+0.03}&layer=mapnik&marker=${latF}%2C${lngF}`;

  return (
    <div className="rounded overflow-hidden border">
      <iframe title="map-fallback" width="100%" height={height} frameBorder="0" src={osmSrc}></iframe>
    </div>
  );
}

export default MapEmbed;
