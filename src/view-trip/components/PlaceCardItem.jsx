import { GetPlaceDetails, PHOTO_REF_URL } from "@/service/GlobalAPI";
import React, { useEffect } from "react";

function PlaceCardItem({ place }) {
  const [photoUrl, setPhotoUrl] = React.useState();

  const getPlacePhoto = async () => {
    const data = { textQuery: place?.name };

    await GetPlaceDetails(data).then((resp) => {
      const photoName = resp?.data?.places?.[0]?.photos?.[3]?.name;
      if (!photoName) {
        return;
      }

      const nextPhotoUrl = PHOTO_REF_URL.replace("{NAME}", photoName);
      setPhotoUrl(nextPhotoUrl);
    });
  };

  useEffect(() => {
    if (place) {
      getPlacePhoto();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place]);

  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${place?.name},${place?.address}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="mt-2 flex cursor-pointer gap-4 rounded-xl border p-5 transition-all hover:scale-105 hover:shadow-md">
        <img src={photoUrl} className="h-32.5 w-32.5 rounded-xl" />
        <div>
          <h4 className="text-lg font-medium">{place?.name}</h4>

          <p className="mt-1 text-sm text-gray-600">{place?.details}</p>

          <div className="mt-2 flex gap-4 text-sm">
            <span>Best time: {place?.bestTime}</span>
            <span>Ticket: {place?.ticket || "Not available"}</span>
            <span>Address: {place?.address}</span>
            <span>Rating: {place?.rating}</span>
          </div>
        </div>
      </div>
    </a>
  );
}

export default PlaceCardItem;
