import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/service/firebase';
import { TrendingUp, MapPin, DollarSign, Calendar, Users } from 'lucide-react';

const COLORS = ['#0ea5a4', '#fb923c', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function ChartAnalysis() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalDestinations: 0,
    avgBudget: 0,
    avgDays: 0,
    popularDestinations: [],
    budgetDistribution: [],
    monthlyTrips: [],
    travelCompanions: [],
    durationDistribution: []
  });

  useEffect(() => {
    fetchTripData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTripData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'AITrips'));
      const trips = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        trips.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });

      analyzeData(trips);
    } catch (error) {
      console.error('Error fetching trip data:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeData = (trips) => {
    if (!trips.length) return;

    // Basic stats
    const totalTrips = trips.length;
    const destinations = new Set();
    let totalBudget = 0;
    let totalDays = 0;
    const destinationCount = {};
    const budgetRanges = { 'Low (< $1000)': 0, 'Medium ($1000-$3000)': 0, 'High ($3000-$5000)': 0, 'Luxury (>$5000)': 0 };
    const monthlyData = {};
    const travelCompanionCount = { 'Solo': 0, 'Couple': 0, 'Family': 0, 'Friends': 0 };
    const durationRanges = { '1-3 Days': 0, '4-7 Days': 0, '8-14 Days': 0, '15+ Days': 0 };

    trips.forEach(trip => {
      // Destinations
      const location = trip.userSelection?.location?.label || trip.userSelection?.location;
      if (location) {
        destinations.add(location);
        destinationCount[location] = (destinationCount[location] || 0) + 1;
      }

      // Budget
      const budget = trip.userSelection?.budget;
      if (budget) {
        const budgetValue = parseBudgetValue(budget);
        totalBudget += budgetValue;

        if (budgetValue < 1000) budgetRanges['Low (< $1000)']++;
        else if (budgetValue < 3000) budgetRanges['Medium ($1000-$3000)']++;
        else if (budgetValue < 5000) budgetRanges['High ($3000-$5000)']++;
        else budgetRanges['Luxury (>$5000)']++;
      }

      // Days
      const days = trip.userSelection?.noOfDays || 0;
      totalDays += days;

      // Duration distribution
      if (days > 0) {
        if (days <= 3) durationRanges['1-3 Days']++;
        else if (days <= 7) durationRanges['4-7 Days']++;
        else if (days <= 14) durationRanges['8-14 Days']++;
        else durationRanges['15+ Days']++;
      }

      // Travel Companions
      const traveler = trip.userSelection?.traveler;
      if (traveler) {
        if (traveler === '1') travelCompanionCount['Solo']++;
        else if (traveler === '2 people') travelCompanionCount['Couple']++;
        else if (traveler === '3 to 5 people') travelCompanionCount['Family']++;
        else if (traveler === '5 to 10 people') travelCompanionCount['Friends']++;
      }

      // Monthly data
      const month = trip.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    // Popular destinations
    const popularDestinations = Object.entries(destinationCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Monthly trips data
    const monthlyTrips = Object.entries(monthlyData)
      .map(([month, count]) => ({ month, trips: count }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));

    // Budget distribution
    const budgetDistribution = Object.entries(budgetRanges)
      .map(([range, count]) => ({ name: range, value: count }))
      .filter(item => item.value > 0);

    // Travel companions distribution
    const travelCompanions = Object.entries(travelCompanionCount)
      .map(([type, count]) => ({ name: type, value: count }))
      .filter(item => item.value > 0);

    // Duration distribution
    const durationDistribution = Object.entries(durationRanges)
      .map(([range, count]) => ({ name: range, value: count }))
      .filter(item => item.value > 0);

    setStats({
      totalTrips,
      totalDestinations: destinations.size,
      avgBudget: Math.round(totalBudget / trips.length),
      avgDays: Math.round(totalDays / trips.length),
      popularDestinations,
      budgetDistribution,
      monthlyTrips,
      travelCompanions,
      durationDistribution
    });
  };

  const parseBudgetValue = (budget) => {
    const budgetMap = {
      'Cheap': 500,
      'Budget': 1000,
      'Mid-range': 2000,
      'Luxury': 5000
    };
    return budgetMap[budget] || 1000;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--color-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-bg)] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[color:var(--color-text)] mb-8">Chart Analysis Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[color:var(--color-surface)] p-6 rounded-lg border border-[color:var(--color-border)]">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-[color:var(--color-primary)]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-[color:var(--color-muted)]">Total Trips</p>
                <p className="text-2xl font-bold text-[color:var(--color-text)]">{stats.totalTrips}</p>
              </div>
            </div>
          </div>

          <div className="bg-[color:var(--color-surface)] p-6 rounded-lg border border-[color:var(--color-border)]">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-[color:var(--color-primary)]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-[color:var(--color-muted)]">Destinations</p>
                <p className="text-2xl font-bold text-[color:var(--color-text)]">{stats.totalDestinations}</p>
              </div>
            </div>
          </div>

          <div className="bg-[color:var(--color-surface)] p-6 rounded-lg border border-[color:var(--color-border)]">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-[color:var(--color-primary)]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-[color:var(--color-muted)]">Avg Budget</p>
                <p className="text-2xl font-bold text-[color:var(--color-text)]">${stats.avgBudget}</p>
              </div>
            </div>
          </div>

          <div className="bg-[color:var(--color-surface)] p-6 rounded-lg border border-[color:var(--color-border)]">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-[color:var(--color-primary)]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-[color:var(--color-muted)]">Avg Days</p>
                <p className="text-2xl font-bold text-[color:var(--color-text)]">{stats.avgDays}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Destinations */}
          <div className="bg-[color:var(--color-surface)] p-6 rounded-lg border border-[color:var(--color-border)]">
            <h2 className="text-xl font-semibold text-[color:var(--color-text)] mb-4">Popular Destinations</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.popularDestinations}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--color-text)"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="var(--color-text)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="count" fill="var(--color-primary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Budget Distribution */}
          <div className="bg-[color:var(--color-surface)] p-6 rounded-lg border border-[color:var(--color-border)]">
            <h2 className="text-xl font-semibold text-[color:var(--color-text)] mb-4">Budget Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.budgetDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.budgetDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Travel Companions Preference */}
          <div className="bg-[color:var(--color-surface)] p-6 rounded-lg border border-[color:var(--color-border)]">
            <h2 className="text-xl font-semibold text-[color:var(--color-text)] mb-4">People Prefer to Travel With</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.travelCompanions}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.travelCompanions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Trip Duration Distribution */}
          <div className="bg-[color:var(--color-surface)] p-6 rounded-lg border border-[color:var(--color-border)]">
            <h2 className="text-xl font-semibold text-[color:var(--color-text)] mb-4">Trip Duration Preference</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.durationDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--color-text)"
                  fontSize={12}
                />
                <YAxis stroke="var(--color-text)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="value" fill="var(--color-primary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Trips Trend */}
          <div className="bg-[color:var(--color-surface)] p-6 rounded-lg border border-[color:var(--color-border)] lg:col-span-2">
            <h2 className="text-xl font-semibold text-[color:var(--color-text)] mb-4">Monthly Trip Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.monthlyTrips}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-text)" />
                <YAxis stroke="var(--color-text)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="trips"
                  stroke="var(--color-primary)"
                  fill="var(--color-primary)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {stats.totalTrips === 0 && (
          <div className="text-center py-12">
            <p className="text-[color:var(--color-muted)] text-lg">No trip data available yet. Create some trips to see analytics!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChartAnalysis;