import { GetPlaceDetails, PHOTO_REF_URL } from '@/service/GlobalAPI';
import React, { useEffect, useState } from 'react';

function UserTripCardItem({ Trip }) {
  const [PhotoUrl, setPhotoUrl] = useState('/placeholder.jpg');

  useEffect(() => {
    const getPlacePhoto = async () => {
      if (!Trip) return;

      try {
        const result = await GetPlaceDetails({
          textQuery: Trip?.userSelection?.location?.label,
        });

        if (result?.data?.places?.[0]?.photos?.[3]?.name) {
          const photoUrl = PHOTO_REF_URL.replace("{NAME}", result.data.places[0].photos[3].name);
          setPhotoUrl(photoUrl);
        }
      } catch (error) {
        console.error("Error fetching place photo:", error);
      }
    };

    getPlacePhoto();
  }, [Trip]);

  return (
    <a href={'/view-trip/'+Trip?.id}>
    <div className='hover:scale-105 transition-all cursor-pointer'>
      <img 
        src={PhotoUrl} 
        className='object-cover rounded-xl h-[250px] w-full' 
        alt={Trip?.userSelection?.location?.label || 'Trip destination'}
      />
      <div className='mt-2'>
        <h2 className='font-bold text-lg'>{Trip?.userSelection?.location?.label}</h2>
        <h2 className='text-sm text-gray-500'>
          {Trip?.userSelection?.noOfDays} Days trip with {Trip?.userSelection?.budget} Budget
        </h2>
      </div>
    </div>
    </a>
  )
}

export default UserTripCardItem