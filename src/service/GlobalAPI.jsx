// GlobalAPI.js
import axios from "axios";

const BASE_URL = "https://places.googleapis.com/v1/places:searchText";

const config = {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": import.meta.env.VITE_GOOGLE_PLACE_API_KEY,
        "X-Goog-FieldMask":
          "places.displayName,places.id,places.photos.name,places.formattedAddress,places.shortFormattedAddress,places.rating,places.userRatingCount,places.editorialSummary,places.googleMapsUri"
      }
    }
  export const GetPlaceDetails = async (data) => {
    const payload = {
      ...data,
      textQuery: data.textQuery || data.query,
      pageSize: data.pageSize ?? data.maxResultCount ?? 8,
    };

    delete payload.query;
    delete payload.maxResultCount;

    return axios.post(BASE_URL, payload, config);
  };
  export const PHOTO_REF_URL="https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=600&maxWidthPx=600&key="+import.meta.env.VITE_GOOGLE_PLACE_API_KEY;
