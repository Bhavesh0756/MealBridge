import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Clock, ShieldCheck, Utensils } from 'lucide-react';

// Custom modern SVG icons
const createCustomIcon = (bgColor, iconText) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background: ${bgColor};
        color: white;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        border: 2px solid white;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        ${iconText}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

const donorIcon = createCustomIcon('#059669', '🍲');
const ngoIcon = createCustomIcon('#2563eb', '🏠');
const volunteerIcon = createCustomIcon('#d97706', '🚚');

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export function LeafletMapView({
  donations = [],
  ngos = [],
  volunteers = [],
  center = [19.076, 72.8777],
  zoom = 12,
  onSelectDonation,
  className = 'h-96 w-full rounded-2xl shadow-sm border border-slate-200 overflow-hidden',
}) {
  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Donation Markers */}
        {donations.map((d) => {
          if (!d.latitude || !d.longitude) return null;
          return (
            <Marker
              key={`donation-${d.id}`}
              position={[parseFloat(d.latitude), parseFloat(d.longitude)]}
              icon={donorIcon}
            >
              <Popup className="custom-popup">
                <div className="p-1 max-w-xs text-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      Food Available
                    </span>
                    <span className="text-xs text-slate-500">{d.category?.name || d.category_name}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">{d.title}</h4>
                  <p className="text-xs text-slate-600 mb-2">{d.pickup_address}</p>
                  <div className="bg-slate-50 p-2 rounded-lg text-xs space-y-1 mb-2 border border-slate-100">
                    <div className="flex justify-between font-semibold">
                      <span>Available:</span>
                      <span className="text-emerald-700">{d.available_quantity} {d.unit}</span>
                    </div>
                    {d.remaining_hours !== undefined && (
                      <div className="flex justify-between text-amber-700 font-medium">
                        <span>Pickup in:</span>
                        <span>{d.remaining_hours} hrs</span>
                      </div>
                    )}
                  </div>
                  {onSelectDonation && (
                    <button
                      onClick={() => onSelectDonation(d)}
                      className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition cursor-pointer text-center"
                    >
                      Request Food Allocation
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* NGO Markers */}
        {ngos.map((ngo) => {
          if (!ngo.latitude || !ngo.longitude) return null;
          return (
            <Marker
              key={`ngo-${ngo.id}`}
              position={[parseFloat(ngo.latitude), parseFloat(ngo.longitude)]}
              icon={ngoIcon}
            >
              <Popup>
                <div className="p-1 max-w-xs text-slate-800">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    NGO Recipient
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">{ngo.organization_name}</h4>
                  <p className="text-xs text-slate-600 mb-1">{ngo.address}</p>
                  <p className="text-xs text-slate-500">
                    Daily Capacity: <strong className="text-slate-800">{ngo.daily_capacity_meals} meals</strong>
                  </p>
                  {ngo.cold_storage_available && (
                    <span className="inline-block mt-1 text-xs text-cyan-700 font-medium">
                      ❄️ Cold Storage Available
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Volunteer Markers */}
        {volunteers.map((vol) => {
          if (!vol.current_latitude || !vol.current_longitude) return null;
          return (
            <Marker
              key={`vol-${vol.id}`}
              position={[parseFloat(vol.current_latitude), parseFloat(vol.current_longitude)]}
              icon={volunteerIcon}
            >
              <Popup>
                <div className="p-1 text-slate-800 text-xs">
                  <span className="font-semibold text-amber-800">🚚 Active Volunteer</span>
                  <p className="font-bold mt-0.5">{vol.full_name}</p>
                  <p className="text-slate-600">Capacity: {vol.max_transport_capacity_kg} kg</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
