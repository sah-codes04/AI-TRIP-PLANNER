import React from 'react'
import { useNavigate } from 'react-router-dom'
import FamousPlaces from '../../view-trip/components/FamousPlaces'

function Hero() {
  const navigate = useNavigate()

  const handleSelectDestination = (selectedPlace) => {
    // Navigate to create-trip page with the selected destination
    navigate('/create-trip', { state: { selectedDestination: selectedPlace } })
  }

  return (
    <div className='mx-auto flex max-w-7xl flex-col items-center gap-9 text-[color:var(--color-text)]'>
      {/* Hero Section */}
      <div className='flex flex-col items-center gap-6 px-4'>
        <h1 className='font-extrabold text-[40px] md:text-[50px] text-center mt-16'>
          <span className='text-[#f12e14]'>Discover Your Next Adventure with AI:</span><br></br>Personalized Itinaries at Your Fingertips
        </h1>
        <p className='max-w-2xl text-center text-lg text-[color:var(--color-muted)] md:text-xl'>
          Your personal trip planner and travel curator, creating custom itineries tailored to your interest and budget.
        </p>

        {/* Create Trip Button */}
        <div className='mt-8'>
          <button
            onClick={() => navigate('/create-trip')}
            className='inline-flex h-12 items-center justify-center rounded-md bg-blue-600 px-8 text-lg font-semibold text-white transition-opacity hover:opacity-90 hover:bg-blue-700'
          >
            Create Personalized Trip
          </button>
        </div>
      </div>

      {/* Famous Places Section */}
      <div className='w-full px-4 mt-16'>
        <FamousPlaces onSelectDestination={handleSelectDestination} />
      </div>
    </div>
  )
}
export default Hero
