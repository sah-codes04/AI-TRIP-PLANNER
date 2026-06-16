// Travel type options
export const SelectTravelList = [
  {
    id: 1,
    title: "Just Me",
    desc: "A sole traveler in exploration",
    icon: "✈️",
    people: "1",
  },
  {
    id: 2,
    title: "A Couple",
    desc: "Two travelers in tandem",
    icon: "🥂",
    people: "2 people",
  },
  {
    id: 3,
    title: "Family",
    desc: "A group of fun loving adventurers",
    icon: "🏡",
    people: "3 to 5 people",
  },
  {
    id: 4,
    title: "Friends",
    desc: "A bunch of thrill-seekers",
    icon: "🍻",
    people: "5 to 10 people",
  },
]

// Budget options
export const SelectBudgetOptions = [
  {
    id: 1,
    title: "Cheap",
    desc: "Stay conscious of costs 💰",
    icon: "💵",
  },
  {
    id: 2,
    title: "Moderate",
    desc: "Keep cost on average side",
    icon: "💸",
  },
  {
    id: 3,
    title: "Luxury",
    desc: "Do not worry about cost",
    icon: "💰",
  },
]

// AI Prompt Template
export const AI_PROMPT = `
Generate a detailed travel plan in JSON for:

Location: {location}
Country: {country}
Days: {totalDays}
Budget: {budget}
Travelers: {traveler}

IMPORTANT:
- Return at least 4 to 6 hotel recommendations.
- Each hotel must have name, address, price, rating, imageUrl.
- Use destination local currency for all prices and ticket costs.
- Every activity ticket must be a realistic numeric estimate or range (example: CHF 25 or CHF 15-30 per adult).
- If an activity has no fee, set ticket exactly as "Free".
- Do not use vague ticket text like "included in package", "extra", "varies", or empty values.
- Return only valid JSON (no markdown, no explanation).


Return only valid JSON in this format:

{
  "trip_overview": {
    "location": "",
    "days": "",
    "budget": "",
    "travelers": ""
  },
  "hotels": [
    {
      "name": "",
      "address": "",
      "price": "",
      "rating": 0,
      "imageUrl": ""
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "theme": "",
      "activities": [
        {
          "name": "",
          "address": "",
          "details": "",
          "ticket": "",
          "rating": 0,
          "bestTime": ""
        }
      ]
    }
  ]
}
`
