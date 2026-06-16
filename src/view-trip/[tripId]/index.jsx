import { db } from "@/service/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import React, { useEffect } from "react";
import { toast } from "sonner";
import InfoSection from "../components/InfoSection";
import Hotels from "../components/Hotels";
import PlaceToVisit from "../components/PlaceToVisit";
import BudgetBreakdown from "../components/BudgetBreakdown";
import Footer from "../components/Footer";

function ViewTrip() {
  const { tripId } = useParams();
  const [Trip, setTrip] = React.useState([]);
  useEffect(() => {     
    tripId && GetTripData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId])
  const GetTripData=async ()=>{
    const docRef=doc(db,"AITrips",tripId);
    const docSnap=await getDoc(docRef);

    if(docSnap.exists()){
      console.log("Document:",docSnap.data());
      setTrip(docSnap.data());
    } else{
      console.log("No such Document");
      toast.error("Trip not found!");
    }
  }

  return (
    <div className='p-10 md:px-20 lg:px-44 xl:px-56'>
      {/*info Section*/}
      <InfoSection Trip={Trip} />
      {/*Recommended Hotels*/}
      <Hotels Trip={Trip} />
      {/*Daily Plan*/}
      <PlaceToVisit Trip={Trip} />
      {/*Budget Breakdown*/}
      <BudgetBreakdown Trip={Trip} />
      {/*Footer*/}
      <Footer Trip={Trip} />

    </div>
  );
}

export default ViewTrip;
