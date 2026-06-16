import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

function PlaceDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { placeId } = useParams();

  // Try to get full place object from navigation state
  const place = location.state?.place || null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>

      {!place && (
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-semibold">Place details</h2>
          <p className="text-gray-500 mt-2">No details available for ID: {placeId}</p>
        </div>
      )}

      {place && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <img src={place.image} alt={place.name} className="w-full h-64 object-cover rounded mb-4" />
          <h1 className="text-2xl font-bold mb-2">{place.name}</h1>
          <p className="text-gray-600 mb-4">{place.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700">
            <div>⭐ Rating: {place.rating}</div>
            <div>📅 Best time: {place.bestTime}</div>
            <div>📍 Address: {place.address}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlaceDetail;
