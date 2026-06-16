import { Button } from "@/components/ui/button";
import { GetPlaceDetails } from "@/service/GlobalAPI";
import React, { useEffect } from "react";
import { IoIosSend } from "react-icons/io";
import { toast } from "sonner";

const PHOTO_REF_URL =
  "https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=600&maxWidthPx=600&key=" +
  import.meta.env.VITE_GOOGLE_PLACE_API_KEY;

function InfoSection({ Trip }) {
  const [photoUrl, setPhotoUrl] = React.useState();

  const getPlacePhoto = async () => {
    const data = {
      textQuery: Trip?.userSelection?.location?.label,
    };

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
    if (Trip) {
      getPlacePhoto();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Trip]);

  const handleShareTrip = () => {
    // Create a shareable trip summary
    const tripDetails = `
📍 Trip to: ${Trip?.userSelection?.location?.label || "Unknown"}
📅 Duration: ${Trip?.userSelection?.noOfDays} days
💰 Budget: ${Trip?.userSelection?.budget}
👥 Travelers: ${Trip?.userSelection?.traveler}

Check out my AI-planned trip on AI Trip Planner!
URL: ${window.location.href}
    `.trim();

    // Try to use native share API if available
    if (navigator.share) {
      navigator.share({
        title: `My ${Trip?.userSelection?.location?.label} Trip`,
        text: tripDetails,
      }).catch(() => {
        // If share API fails, fall back to clipboard
        copyToClipboard(tripDetails);
      });
    } else {
      // Fallback to clipboard
      copyToClipboard(tripDetails);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Trip details copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy to clipboard");
    });
  };

  return (
    <div>
      <img src={photoUrl} className="h-85 w-full rounded-xl object-cover" />
      <div className="flex items-center justify-between">
        <div className="my-5 flex flex-col items-start gap-2 text-left">
          <h2 className="text-2xl font-bold">
            {Trip?.userSelection?.location?.label || "Location not available"}
          </h2>
          <div className="hidden gap-5 sm:flex">
            <h2 className="rounded-full bg-gray-200 p-1 px-3 text-xs text-gray-700 md:text-md">
              Days: {Trip?.userSelection?.noOfDays}
            </h2>
            <h2 className="rounded-full bg-gray-200 p-1 px-3 text-xs text-gray-700 md:text-md">
              Budget: {Trip?.userSelection?.budget}
            </h2>
            <h2 className="rounded-full bg-gray-200 p-1 px-3 text-xs text-gray-700 md:text-md">
              Travelers: {Trip?.userSelection?.traveler}
            </h2>
          </div>
        </div>
        <Button 
          onClick={handleShareTrip}
          className="bg-black text-white hover:bg-purple-600 transition-colors duration-200"
          title="Share Trip"
        >
          <IoIosSend />
        </Button>
      </div>
    </div>
  );
}

export default InfoSection;
