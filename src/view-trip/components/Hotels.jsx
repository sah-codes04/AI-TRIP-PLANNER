import React from 'react'
import HotelCardItem from './HotelCardItem';

function Hotels({ Trip }) {
  
  return (
    <div>
    <h2 className='font-bold text-xl mt-5'>Hotel Recomendation</h2>

    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-5'>
    {Trip?.tripData?.hotels?.map((hotel, index)=>(
      <HotelCardItem hotel={hotel} key={index} />
      
    ))}
    </div>
    </div>

  )
}

export default Hotels
