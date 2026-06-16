import React, { useEffect, useState } from "react";
import { MapPin, Star, TrendingUp, Filter } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GetPlaceDetails, PHOTO_REF_URL } from "@/service/GlobalAPI";

// Category definitions
const PLACE_CATEGORIES = [
  { id: "all", label: "All Places", icon: "🌍" },
  { id: "historical", label: "Historical", icon: "🏛️", keywords: ["monument", "historical", "temple", "ancient", "heritage", "ruins", "fort", "palace"] },
  { id: "adventure", label: "Adventure", icon: "🧗", keywords: ["trek", "hiking", "adventure", "mountain", "climbing", "extreme", "sports", "wildlife"] },
  { id: "cultural", label: "Cultural", icon: "🎭", keywords: ["museum", "culture", "art", "traditional", "historic district", "cultural", "local", "architecture"] },
  { id: "beach", label: "Beach", icon: "🏖️", keywords: ["beach", "sea", "coast", "island", "water", "resort", "marine"] },
  { id: "natural", label: "Natural", icon: "🌿", keywords: ["national park", "natural", "waterfall", "nature", "lake", "forest", "garden", "landscape"] }
];

const FALLBACK_COUNTRIES = [
  "Australia",
  "Austria",
  "Belgium",
  "Brazil",
  "Canada",
  "China",
  "Denmark",
  "Egypt",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Ireland",
  "Israel",
  "Italy",
  "Japan",
  "Kenya",
  "Malaysia",
  "Mexico",
  "Morocco",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Peru",
  "Philippines",
  "Portugal",
  "Singapore",
  "South Africa",
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "Thailand",
  "Turkey",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Vietnam"
];

function getCountryListFromIntl() {
  if (
    typeof Intl === "undefined" ||
    typeof Intl.DisplayNames === "undefined" ||
    typeof Intl.supportedValuesOf !== "function"
  ) {
    return FALLBACK_COUNTRIES;
  }

  try {
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    const names = Intl.supportedValuesOf("region")
      .filter((code) => code.length === 2)
      .map((code) => displayNames.of(code))
      .filter((name) => typeof name === "string" && name.trim().length > 0);

    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error("Failed to build country list from Intl:", error);
    return FALLBACK_COUNTRIES;
  }
}

function buildDestinationSelection(place) {
  const locationLabel = place.address || place.name;

  return {
    label: locationLabel,
    value: {
      description: locationLabel,
      place_id: `google_${place.id}`,
    },
  };
}

function InfoBadge({ icon, label, value }) {
  const IconComponent = icon;

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--color-border)] px-2 py-1 text-xs text-[color:var(--color-muted)]">
      <IconComponent className="h-3.5 w-3.5" />
      {label}: {value}
    </span>
  );
}

// Function to categorize a place based on keywords
function categorizePlace(place) {
  const text = `${place.displayName?.text || ""} ${place.editorialSummary?.text || ""} ${place.types?.join(" ") || ""}`.toLowerCase();
  
  const categories = [];
  
  PLACE_CATEGORIES.forEach((category) => {
    if (category.id === "all") return;
    if (category.keywords.some((keyword) => text.includes(keyword.toLowerCase()))) {
      categories.push(category.id);
    }
  });
  
  return categories.length > 0 ? categories : ["cultural"]; // Default to cultural if no match
}

function mapGooglePlaceToCard(place, country) {
  const placeId = place?.id || `${country}-${place?.displayName?.text || "place"}`;
  const imageRef = place?.photos?.[0]?.name;

  return {
    id: placeId,
    name: place?.displayName?.text || "Unknown place",
    description:
      place?.editorialSummary?.text || `One of the famous places to visit in ${country}.`,
    rating: typeof place?.rating === "number" ? place.rating : null,
    ratingCount: typeof place?.userRatingCount === "number" ? place.userRatingCount : null,
    address: place?.formattedAddress || place?.shortFormattedAddress || country,
    bestTime: "Year-round",
    mapsUrl: place?.googleMapsUri || "",
    image: imageRef ? PHOTO_REF_URL.replace("{NAME}", imageRef) : "/placeholder.png",
    categories: categorizePlace(place),
  };
}

function mergeAndRankPlaces(places, country) {
  const unique = new Map();

  places.forEach((place) => {
    const mappedPlace = mapGooglePlaceToCard(place, country);
    if (!unique.has(mappedPlace.id)) {
      unique.set(mappedPlace.id, mappedPlace);
    }
  });

  return Array.from(unique.values()).sort((a, b) => {
    const ratingA = typeof a.rating === "number" ? a.rating : 0;
    const ratingB = typeof b.rating === "number" ? b.rating : 0;
    const countA = typeof a.ratingCount === "number" ? a.ratingCount : 0;
    const countB = typeof b.ratingCount === "number" ? b.ratingCount : 0;

    if (ratingB !== ratingA) return ratingB - ratingA;
    return countB - countA;
  });
}

function FamousPlaces({ Trip, onSelectDestination }) {
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [famousPlaces, setFamousPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState("");

  const tripDestination = Trip?.userSelection?.location?.label?.split(",")[0]?.trim() || "";

  useEffect(() => {
    const intlCountries = getCountryListFromIntl();

    setCountries(intlCountries);
    setSelectedCountry((prev) =>
      prev || (intlCountries.includes("India") ? "India" : intlCountries[0] || "")
    );
    setCountriesLoading(false);
  }, []);

  useEffect(() => {
    if (!selectedCountry) return;
    let isActive = true;

    const loadFamousPlaces = async () => {
      setPlacesLoading(true);
      setPlacesError("");

      try {
        const queries = [
          `top tourist attractions in ${selectedCountry}`,
          `famous landmarks in ${selectedCountry}`,
          `best places to visit in ${selectedCountry}`,
        ];

        const results = await Promise.allSettled(
          queries.map((textQuery) =>
            GetPlaceDetails({
              textQuery,
              maxResultCount: 8,
              languageCode: "en",
            })
          )
        );

        const combinedPlaces = results
          .filter((result) => result.status === "fulfilled")
          .flatMap((result) => result.value?.data?.places || []);

        const mergedPlaces = mergeAndRankPlaces(combinedPlaces, selectedCountry).slice(0, 12);
        if (!isActive) return;

        setFamousPlaces(mergedPlaces);
        setSelectedCategory("all");
        if (!mergedPlaces.length) {
          setPlacesError(`No famous places found for ${selectedCountry}. Try another country.`);
        }
      } catch (error) {
        console.error("Failed to load famous places:", error);
        if (!isActive) return;
        setFamousPlaces([]);
        setPlacesError(`Unable to fetch famous places for ${selectedCountry} right now.`);
      } finally {
        if (isActive) setPlacesLoading(false);
      }
    };

    loadFamousPlaces();

    return () => {
      isActive = false;
    };
  }, [selectedCountry]);

  // Filter places based on selected category
  const filteredPlaces = selectedCategory === "all" 
    ? famousPlaces 
    : famousPlaces.filter((place) => place.categories.includes(selectedCategory));

  return (
    <div className="mt-10">
      <h2 className="text-center text-3xl font-bold text-modern">Explore Famous Places By Country</h2>
      <p className="mx-auto mb-8 mt-3 max-w-3xl text-center text-[color:var(--color-muted)]">
        {tripDestination
          ? `You selected ${tripDestination}. Pick any country to view its famous places.`
          : "Pick any country in the world from the dropdown to view its famous places."}
      </p>

      <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
        <div className="flex items-center gap-3">
          <label htmlFor="country-select" className="whitespace-nowrap text-sm font-medium">
            Country
          </label>
          <select
            id="country-select"
            value={selectedCountry}
            onChange={(event) => setSelectedCountry(event.target.value)}
            disabled={countriesLoading}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 text-sm text-[color:var(--color-text)]"
          >
            {countriesLoading ? (
              <option>Loading countries...</option>
            ) : (
              countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Category Filter */}
      {!placesLoading && !placesError && famousPlaces.length > 0 && (
        <div className="mt-6 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-5 w-5 text-[color:var(--color-muted)]" />
            <span className="font-medium text-sm">Filter by Category</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PLACE_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  selectedCategory === category.id
                    ? "bg-[color:var(--color-primary)] text-white font-medium shadow-lg"
                    : "bg-[color:var(--color-surface-hover)] text-[color:var(--color-text)] border border-[color:var(--color-border)] hover:bg-[color:var(--color-primary)] hover:text-white"
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="text-sm">{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <h3 className="mb-4 text-xl font-semibold">
          {selectedCountry 
            ? `${selectedCategory === "all" ? "Top Famous Places" : PLACE_CATEGORIES.find(c => c.id === selectedCategory)?.label + " Places"} in ${selectedCountry}` 
            : "Top Famous Places"}
        </h3>

        {placesLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]"
              />
            ))}
          </div>
        ) : null}

        {!placesLoading && placesError ? (
          <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 text-center text-[color:var(--color-muted)]">
            {placesError}
          </div>
        ) : null}

        {!placesLoading && !placesError && filteredPlaces.length === 0 ? (
          <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 text-center text-[color:var(--color-muted)]">
            No {selectedCategory === "all" ? "" : PLACE_CATEGORIES.find(c => c.id === selectedCategory)?.label.toLowerCase() + " "} places found. Try different category or country.
          </div>
        ) : null}

        {!placesLoading && !placesError && filteredPlaces.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredPlaces.map((place) => (
              <article
                key={place.id}
                onClick={() => navigate(`/place/${place.id}`, { state: { place } })}
                className="cursor-pointer overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <img src={place.image} alt={place.name} className="h-56 w-full object-cover" />
                <div className="p-3">
                  <h4 className="text-base font-semibold">{place.name}</h4>
                  <p className="mt-1 line-clamp-2 text-xs text-[color:var(--color-muted)]">
                    {place.description}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1">
                    <InfoBadge
                      icon={Star}
                      label="Rating"
                      value={typeof place.rating === "number" ? place.rating.toFixed(1) : "N/A"}
                    />
                    <InfoBadge icon={TrendingUp} label="Type" value="Famous" />
                    <InfoBadge icon={MapPin} label="Country" value={selectedCountry} />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="line-clamp-1 text-xs text-[color:var(--color-muted)]">
                      {place.address}
                    </span>
                    {onSelectDestination ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelectDestination(buildDestinationSelection(place));
                        }}
                        className="bg-[color:var(--color-text)] text-[color:var(--color-bg)]"
                      >
                        Plan Trip
                      </Button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>

      
    </div>
  );
}

export default FamousPlaces;
