import { GetPlaceDetails, PHOTO_REF_URL } from "@/service/GlobalAPI";
import React, { useEffect } from "react";

function HotelCardItem({ hotel }) {
  const [photoUrl, setPhotoUrl] = React.useState();

  const getPlacePhoto = async () => {
    const data = { textQuery: hotel?.name };

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
    if (hotel) {
      getPlacePhoto();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotel]);

  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${hotel?.name},${hotel?.address}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="cursor-pointer transition-all hover:scale-105">
        <img src={photoUrl} className="h-40 w-full rounded-xl object-cover" />
        <div className="my-2">
          <h2 className="font-medium">{hotel?.name}</h2>
          <h2 className="text-xs text-gray-600">Location: {hotel?.address}</h2>
          <h2 className="text-sm">Price: {hotel?.price}</h2>
          <h2 className="text-sm">Rating: {hotel?.rating}</h2>
        </div>
      </div>
    </a>
  );
}

export default HotelCardItem;
