import { db } from "@/service/firebase";
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  increment,
  serverTimestamp,
  collection,
  query,
  orderBy,
  limit,
  getDocs
} from "firebase/firestore";

export const trendingService = {

  // 🔥 Track User Search (for backward compatibility)
  async trackSearch(destination) {
    const docRef = doc(db, "trending_destinations", destination);

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Increase count
      await updateDoc(docRef, {
        count: increment(1),
        lastSearched: serverTimestamp()
      });
    } else {
      // Create new entry
      await setDoc(docRef, {
        name: destination,
        count: 1,
        lastSearched: serverTimestamp()
      });
    }
  },

  // 🔥 Get Top Trending from Actual Trip Data
  async getTopTrending(limitCount = 3) {
    try {
      // Get all trips from AITrips collection
      const tripsQuery = query(collection(db, "AITrips"));
      const tripsSnapshot = await getDocs(tripsQuery);

      // Count destinations from actual trips
      const destinationCount = {};

      tripsSnapshot.docs.forEach(doc => {
        const tripData = doc.data();
        if (tripData.userSelection && tripData.userSelection.location) {
          const destination = tripData.userSelection.location.label || tripData.userSelection.location;

          // Clean up destination name (remove country/state info)
          const cleanDestination = destination.split(',')[0].trim();

          if (cleanDestination && cleanDestination !== 'Unknown Place') {
            destinationCount[cleanDestination] = (destinationCount[cleanDestination] || 0) + 1;
          }
        }
      });

      // Convert to array and sort by count
      const sortedDestinations = Object.entries(destinationCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limitCount)
        .map(([name, count], index) => ({
          id: `trip_${name}_${index}`,
          name: name,
          count: count,
          source: 'trips' // Indicate this comes from actual trips
        }));

      // If no trip data, fall back to trending_destinations collection
      if (sortedDestinations.length === 0) {
        console.log("No trip data found, falling back to search trends");
        const fallbackQuery = query(
          collection(db, "trending_destinations"),
          orderBy("count", "desc"),
          limit(limitCount)
        );

        const fallbackSnapshot = await getDocs(fallbackQuery);
        return fallbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          source: 'searches'
        }));
      }

      return sortedDestinations;

    } catch (error) {
      console.error("Error fetching trending destinations:", error);

      // Final fallback - return some default destinations
      return [
        { id: 'default_1', name: 'Paris', count: 10, source: 'default' },
        { id: 'default_2', name: 'Tokyo', count: 8, source: 'default' },
        { id: 'default_3', name: 'New York', count: 6, source: 'default' }
      ];
    }
  }
};
