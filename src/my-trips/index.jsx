import { db } from '@/service/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserTripCardItem from './components/UserTripCardItem';


function MyTrips() {
  const navigate = useNavigate();
  const [userTrips, setUserTrips] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      const user = JSON.parse(localStorage.getItem('user'));

      if (!user) {
        navigate('/');
        return;
      }

      setUserTrips([]);
      const q = query(collection(db, 'AITrips'), where('userEmail', '==', user?.email));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setUserTrips((prevTrips) => [...prevTrips, doc.data()]);
      });
    };

    fetchTrips();
  }, [navigate]);

  return (
    <div className='sm:p-10 md:px-32 lg:px-56 xl:px-72 px-5 mt-10'>
      <h2>My Trips</h2>
      <div className='grid sm:grid-cols-2 md:grid-cols-3  gap-5 mt-10'>
        {userTrips?.length > 0 ? userTrips.map((Trip, index) => (
            <UserTripCardItem  Trip={Trip} key={index} />
        )) : <p>No trips found.</p>}
        
      </div>
    </div>
  );
}

export default MyTrips;
