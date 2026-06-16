import React, { useEffect, useState } from "react";
import { trendingService } from "@/service/TrendingService";
import { TrendingUp } from "lucide-react";
import { GetPlaceDetails, PHOTO_REF_URL } from "@/service/GlobalAPI";

function TrendingDestinations({ onSelectDestination }) {
  const [trendingPlaces, setTrendingPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrending();

    const interval = setInterval(loadTrending, 8000);
    return () => clearInterval(interval);
  }, []);

  const loadTrending = async () => {
    try {
      const data = await trendingService.getTopTrending(3);

      const withImages = await Promise.all(
        data.map(async (place) => {
          try {
            const result = await GetPlaceDetails({
              textQuery: place.name
            });

            const photoName =
              result?.data?.places?.[0]?.photos?.[0]?.name;

            if (photoName) {
              return {
                ...place,
                image: PHOTO_REF_URL.replace("{NAME}", photoName)
              };
            }

            return { ...place, image: "/placeholder.jpg" };
          } catch {
            return { ...place, image: "/placeholder.jpg" };
          }
        })
      );

      setTrendingPlaces(withImages);
    } catch (err) {
      console.error("Trending load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          Trending Destinations
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-60 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl"/>
          ))}
        </div>
      </div>
    );
  }

  if (!trendingPlaces.length) return null;

  return (
    <div className="mt-8">
      <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
        <TrendingUp className="w-5 h-5 text-orange-500" />
        Trending Destinations
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trendingPlaces.map((place, index) => (
          <div
            key={place.id}
            onClick={() =>
              onSelectDestination({
                label: place.name,
                value: {
                  description: place.name,
                  place_id: `trending_${place.name}`
                }
              })
            }
            className="cursor-pointer hover:scale-105 transition-all rounded-xl overflow-hidden shadow-md bg-white dark:bg-gray-900"
          >
            <div className="relative">
              <img
                src={place.image}
                className="h-36 w-full object-cover"
                alt={place.name}
                loading="lazy"
                onError={(e) => e.target.src = "/placeholder.jpg"}
              />

              <span className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                #{index + 1}
              </span>

              <span className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
                🔥 Live
              </span>
            </div>

            <div className="p-4">
              <h2 className="text-lg font-semibold">{place.name}</h2>

              <p className="text-sm text-gray-500">
                {place.count} trips created
              </p>

              {place.source === "trips" && (
                <p className="text-xs text-green-600 font-medium mt-1">
                  📍 Based on real trips
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrendingDestinations;