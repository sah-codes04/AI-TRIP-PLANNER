import React from "react";
import PlaceCardItem from "./PlaceCardItem";

function PlaceToVisit({ Trip }) {
  return (
    <div className="mt-10">
      <h2 className="font-bold text-2xl mb-5">📍 Places to Visit</h2>

      {Trip?.tripData?.itinerary?.map((dayItem, index) => (
        <div key={index} className="mb-6">
          
          {/* Day heading */}
          <h3 className="font-semibold text-xl mb-3">
            Day {dayItem.day}
          </h3>

          {/* Places / Activities */}
          <div className="grid gap-4">
            {dayItem.activities.map((place,i) => (
              <div key={i}>
                <h2>
                  <div>
                    <PlaceCardItem place={place} />
                  </div>
                </h2>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PlaceToVisit;
