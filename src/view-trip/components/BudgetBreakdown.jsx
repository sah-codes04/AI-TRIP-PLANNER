import React from 'react';
import { DollarSign, Home, Utensils, Car, Camera, ShoppingBag, Heart } from 'lucide-react';

function BudgetBreakdown({ Trip }) {
  if (!Trip?.tripData?.itinerary || !Trip?.userSelection) {
    return null;
  }

  const { userSelection, tripData } = Trip;
  const { budget, noOfDays, traveler, country } = userSelection;

  // Country-specific cost multipliers (relative to US/UK baseline = 1.0)
  const getCountryMultiplier = (country) => {
    const multipliers = {
      // Very expensive countries
      'switzerland': 2.5,
      'norway': 2.3,
      'iceland': 2.2,
      'denmark': 2.1,
      'sweden': 2.0,
      'finland': 1.9,
      'singapore': 1.8,
      'australia': 1.7,
      'new-zealand': 1.7,
      'canada': 1.6,
      'austria': 1.6,
      'germany': 1.5,
      'netherlands': 1.5,
      'belgium': 1.5,
      'france': 1.5,
      'italy': 1.5,
      'spain': 1.4,
      'portugal': 1.4,
      'greece': 1.4,
      'ireland': 1.4,
      'uk': 1.3,
      'usa': 1.3,
      'japan': 1.3,
      'south-korea': 1.3,

      // Moderate countries
      'czech-republic': 1.2,
      'hungary': 1.2,
      'poland': 1.2,
      'croatia': 1.2,
      'scotland': 1.2,
      'wales': 1.2,
      'uae': 1.2,
      'south-africa': 1.1,
      'argentina': 1.1,
      'chile': 1.1,
      'peru': 1.1,

      // Affordable countries
      'mexico': 1.0,
      'brazil': 1.0,
      'turkey': 0.9,
      'thailand': 0.8,
      'vietnam': 0.8,
      'indonesia': 0.8,
      'malaysia': 0.8,
      'philippines': 0.8,
      'india': 0.7,
      'egypt': 0.7,
      'morocco': 0.7,
    };
    return multipliers[country] || 1.0; // Default to 1.0 if country not found
  };

  // Calculate base costs based on budget category
  const getBudgetMultiplier = (budget) => {
    const multipliers = {
      'Cheap': 0.7,
      'Budget': 1.0,
      'Mid-range': 1.5,
      'Luxury': 2.5
    };
    return multipliers[budget] || 1.0;
  };

  // Calculate traveler multiplier
  const getTravelerMultiplier = (traveler) => {
    const multipliers = {
      'Just Me': 1.0,
      'Couple': 1.8,
      'Family': 2.5,
      'Friends': 2.2
    };
    return multipliers[traveler] || 1.0;
  };

  const budgetMultiplier = getBudgetMultiplier(budget);
  const travelerMultiplier = getTravelerMultiplier(traveler);
  const countryMultiplier = getCountryMultiplier(country);

  // Calculate activity costs from itinerary
  const calculateActivityCosts = () => {
    let totalActivityCost = 0;
    const activities = tripData.itinerary.flatMap(day => day.activities || []);

    activities.forEach(activity => {
      if (activity.ticket && activity.ticket !== 'Not available' && activity.ticket !== 'Free') {
        // Extract numeric value from ticket string
        const ticketMatch = activity.ticket.match(/[\d,]+(?:\.\d+)?/);
        if (ticketMatch) {
          const cost = parseFloat(ticketMatch[0].replace(',', ''));
          if (!isNaN(cost)) {
            totalActivityCost += cost;
          }
        }
      }
    });

    return totalActivityCost;
  };

  // Base costs in USD (will be multiplied by country factor)
  const baseDailyCost = 100 * budgetMultiplier; // Base cost per day
  const accommodationPerNight = baseDailyCost * 0.4; // 40% for accommodation
  const foodPerDay = baseDailyCost * 0.3; // 30% for food
  const transportationPerDay = baseDailyCost * 0.15; // 15% for transportation
  const miscellaneousPerDay = baseDailyCost * 0.15; // 15% for miscellaneous

  const totalAccommodation = accommodationPerNight * (noOfDays - 1); // Assuming last day no accommodation
  const totalFood = foodPerDay * noOfDays;
  const totalTransportation = transportationPerDay * noOfDays;
  const totalMiscellaneous = miscellaneousPerDay * noOfDays;
  const totalActivities = calculateActivityCosts();

  const subtotal = totalAccommodation + totalFood + totalTransportation + totalMiscellaneous + totalActivities;
  const taxAndFees = subtotal * 0.08; // 8% tax and fees
  const totalEstimated = subtotal + taxAndFees;

  // Apply all multipliers
  const adjustedTotal = totalEstimated * travelerMultiplier * countryMultiplier;

  const budgetBreakdown = [
    {
      category: 'Accommodation',
      icon: Home,
      amount: totalAccommodation * travelerMultiplier * countryMultiplier,
      percentage: ((totalAccommodation * travelerMultiplier * countryMultiplier) / adjustedTotal) * 100,
      description: `${noOfDays - 1} nights at estimated rate`
    },
    {
      category: 'Food & Dining',
      icon: Utensils,
      amount: totalFood * travelerMultiplier * countryMultiplier,
      percentage: ((totalFood * travelerMultiplier * countryMultiplier) / adjustedTotal) * 100,
      description: `${noOfDays} days of meals`
    },
    {
      category: 'Transportation',
      icon: Car,
      amount: totalTransportation * travelerMultiplier * countryMultiplier,
      percentage: ((totalTransportation * travelerMultiplier * countryMultiplier) / adjustedTotal) * 100,
      description: 'Local transport and transfers'
    },
    {
      category: 'Activities & Attractions',
      icon: Camera,
      amount: totalActivities,
      percentage: (totalActivities / adjustedTotal) * 100,
      description: `${tripData.itinerary.flatMap(day => day.activities || []).length} planned activities`
    },
    {
      category: 'Miscellaneous',
      icon: ShoppingBag,
      amount: totalMiscellaneous * travelerMultiplier * countryMultiplier,
      percentage: ((totalMiscellaneous * travelerMultiplier * countryMultiplier) / adjustedTotal) * 100,
      description: 'Shopping, tips, and extras'
    },
    {
      category: 'Taxes & Fees',
      icon: Heart,
      amount: taxAndFees * travelerMultiplier * countryMultiplier,
      percentage: ((taxAndFees * travelerMultiplier * countryMultiplier) / adjustedTotal) * 100,
      description: 'Service charges and taxes'
    }
  ];

  const getCountryDisplayName = (countryCode) => {
    const countryNames = {
      'india': 'India',
      'thailand': 'Thailand',
      'japan': 'Japan',
      'usa': 'United States',
      'uk': 'United Kingdom',
      'france': 'France',
      'germany': 'Germany',
      'italy': 'Italy',
      'spain': 'Spain',
      'australia': 'Australia',
      'canada': 'Canada',
      'switzerland': 'Switzerland',
      'netherlands': 'Netherlands',
      'singapore': 'Singapore',
      'uae': 'United Arab Emirates',
      'brazil': 'Brazil',
      'mexico': 'Mexico',
      'south-korea': 'South Korea',
      'vietnam': 'Vietnam',
      'indonesia': 'Indonesia',
      'malaysia': 'Malaysia',
      'philippines': 'Philippines',
      'turkey': 'Turkey',
      'egypt': 'Egypt',
      'morocco': 'Morocco',
      'south-africa': 'South Africa',
      'argentina': 'Argentina',
      'chile': 'Chile',
      'peru': 'Peru',
      'new-zealand': 'New Zealand',
      'iceland': 'Iceland',
      'norway': 'Norway',
      'sweden': 'Sweden',
      'denmark': 'Denmark',
      'finland': 'Finland',
      'portugal': 'Portugal',
      'greece': 'Greece',
      'croatia': 'Croatia',
      'czech-republic': 'Czech Republic',
      'hungary': 'Hungary',
      'poland': 'Poland',
      'austria': 'Austria',
      'belgium': 'Belgium',
      'ireland': 'Ireland',
      'scotland': 'Scotland',
      'wales': 'Wales'
    };
    return countryNames[countryCode] || countryCode?.replace('-', ' ') || 'Unknown Country';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getBudgetRange = (budget) => {
    const ranges = {
      'Cheap': { min: 500, max: 1000 },
      'Budget': { min: 1000, max: 2000 },
      'Mid-range': { min: 2000, max: 4000 },
      'Luxury': { min: 4000, max: 8000 }
    };
    return ranges[budget] || { min: 1000, max: 3000 };
  };

  const budgetRange = getBudgetRange(budget);
  const isWithinBudget = adjustedTotal >= budgetRange.min && adjustedTotal <= budgetRange.max;

  return (
    <div className="mt-10">
      <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6">
        <div className="mb-6 flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-[color:var(--color-primary)]" />
          <h2 className="text-2xl font-bold text-[color:var(--color-text)]">Budget Breakdown</h2>
        </div>

        {/* Budget Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-[color:var(--color-surface-hover)] p-4">
            <p className="text-sm text-[color:var(--color-muted)]">Selected Budget</p>
            <p className="text-xl font-semibold text-[color:var(--color-text)]">{budget}</p>
            <p className="text-xs text-[color:var(--color-muted)]">
              Range: {formatCurrency(budgetRange.min)} - {formatCurrency(budgetRange.max)}
            </p>
          </div>
          <div className="rounded-lg bg-[color:var(--color-surface-hover)] p-4">
            <p className="text-sm text-[color:var(--color-muted)]">Destination Country</p>
            <p className="text-xl font-semibold text-[color:var(--color-text)]">
              {getCountryDisplayName(country)}
            </p>
            <p className="text-xs text-[color:var(--color-muted)]">
              Cost factor: {countryMultiplier.toFixed(1)}x baseline
            </p>
          </div>
          <div className={`rounded-lg p-4 ${isWithinBudget ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <p className="text-sm opacity-75">Budget Status</p>
            <p className="text-xl font-semibold">
              {isWithinBudget ? 'Within Budget' : 'Over Budget'}
            </p>
            <p className="text-xs opacity-75">
              {isWithinBudget
                ? `Under by ${formatCurrency(budgetRange.max - adjustedTotal)}`
                : `Over by ${formatCurrency(adjustedTotal - budgetRange.max)}`
              }
            </p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[color:var(--color-text)]">Cost Breakdown</h3>

          {budgetBreakdown.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center justify-between rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[color:var(--color-surface-hover)] p-2">
                    <Icon className="h-4 w-4 text-[color:var(--color-primary)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[color:var(--color-text)]">{item.category}</p>
                    <p className="text-sm text-[color:var(--color-muted)]">{item.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[color:var(--color-text)]">
                    {formatCurrency(item.amount)}
                  </p>
                  <p className="text-sm text-[color:var(--color-muted)]">
                    {item.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Summary */}
        <div className="mt-6 rounded-lg bg-[color:var(--color-surface-hover)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-[color:var(--color-text)]">Total Estimated Cost</p>
              <p className="text-sm text-[color:var(--color-muted)]">
                For {noOfDays} days • {traveler} • {budget} budget • {getCountryDisplayName(country)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[color:var(--color-primary)]">
                {formatCurrency(adjustedTotal)}
              </p>
              <p className="text-sm text-[color:var(--color-muted)]">
                ≈ {formatCurrency(adjustedTotal / noOfDays)} per day
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> This is an estimated breakdown based on typical costs for {getCountryDisplayName(country)}. Actual expenses may vary depending on your choices, exchange rates, and seasonal pricing. Activity costs are calculated from planned attractions. Country cost factors are relative to Western European/North American baselines.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BudgetBreakdown;