import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search, X } from 'lucide-react';
import { fetchAvailableFlights, ApiError } from '../services/api';
import type { Flight } from '../types/flight';

interface FlightAvailabilityTableProps {
  onUnauthorized: () => void;
}

export function FlightAvailabilityTable({ onUnauthorized }: FlightAvailabilityTableProps) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [flightQuery, setFlightQuery] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');

  const loadFlights = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await fetchAvailableFlights();
        setFlights(data);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          onUnauthorized();
          return;
        }
        setError(
          err instanceof Error ? err.message : 'Unable to load available flights.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [onUnauthorized]
  );

  useEffect(() => {
    loadFlights(false);
  }, [loadFlights]);

  const origins = useMemo(
    () => Array.from(new Set(flights.map((f) => f.origin))).sort(),
    [flights]
  );

  const destinations = useMemo(
    () => Array.from(new Set(flights.map((f) => f.destination))).sort(),
    [flights]
  );

  const filteredFlights = useMemo(() => {
    const query = flightQuery.trim().toLowerCase();
    return flights.filter((flight) => {
      const matchesNumber =
        !query || flight.flightNumber.toLowerCase().includes(query);
      const matchesOrigin =
        !selectedOrigin || flight.origin === selectedOrigin;
      const matchesDest =
        !selectedDestination || flight.destination === selectedDestination;
      return matchesNumber && matchesOrigin && matchesDest;
    });
  }, [flights, flightQuery, selectedOrigin, selectedDestination]);

  const hasActiveFilters =
    flightQuery.trim().length > 0 ||
    selectedOrigin.length > 0 ||
    selectedDestination.length > 0;

  const clearFilters = () => {
    setFlightQuery('');
    setSelectedOrigin('');
    setSelectedDestination('');
  };

  return (
    <section aria-labelledby="available-flights-heading" className="space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <div>
          <h1
            id="available-flights-heading"
            className="font-display text-2xl font-bold tracking-tight text-slate-900"
          >
            Available Flights
          </h1>
          <p className="mt-1 text-sm text-slate-600 tabular-nums">
            Showing {filteredFlights.length} of {flights.length} available departures
          </p>
        </div>
      </div>

      {/* Main Table Card (Single-level elevation) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            {/* Search by Flight Number */}
            <div className="lg:col-span-4">
              <label
                htmlFor="search-flight"
                className="block text-xs font-medium text-slate-600 mb-1.5"
              >
                Flight Number
              </label>
              <div className="relative">
                <Search
                  className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="search-flight"
                  type="text"
                  value={flightQuery}
                  onChange={(e) => setFlightQuery(e.target.value)}
                  placeholder="Search e.g. AI101"
                  className="w-full h-10 pl-9 pr-8 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
                />
                {flightQuery && (
                  <button
                    type="button"
                    onClick={() => setFlightQuery('')}
                    aria-label="Clear flight number search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter by Origin */}
            <div className="lg:col-span-3">
              <label
                htmlFor="filter-origin"
                className="block text-xs font-medium text-slate-600 mb-1.5"
              >
                Origin
              </label>
              <select
                id="filter-origin"
                value={selectedOrigin}
                onChange={(e) => setSelectedOrigin(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
              >
                <option value="">All Origins</option>
                {origins.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Destination */}
            <div className="lg:col-span-3">
              <label
                htmlFor="filter-destination"
                className="block text-xs font-medium text-slate-600 mb-1.5"
              >
                Destination
              </label>
              <select
                id="filter-destination"
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
              >
                <option value="">All Destinations</option>
                {destinations.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="lg:col-span-2 flex items-center justify-end gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-10 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => loadFlights(true)}
                disabled={loading || refreshing}
                className="h-10 px-4 rounded-lg bg-sky-700 hover:bg-sky-800 disabled:opacity-60 text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-600"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-8 text-center">
            <p className="text-sm text-rose-700 font-medium">{error}</p>
            <button
              type="button"
              onClick={() => loadFlights(true)}
              className="mt-3 h-10 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {!error && loading && (
          <div className="divide-y divide-slate-100" aria-busy="true" aria-label="Loading flights">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="px-5 py-3.5 grid grid-cols-6 gap-4 animate-pulse"
              >
                <div className="h-4 bg-slate-200 rounded w-16" />
                <div className="h-4 bg-slate-200 rounded w-24" />
                <div className="h-4 bg-slate-200 rounded w-24" />
                <div className="h-4 bg-slate-200 rounded w-14" />
                <div className="h-4 bg-slate-200 rounded w-14" />
                <div className="h-4 bg-slate-200 rounded w-16 ml-auto" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!error && !loading && filteredFlights.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-base font-semibold text-slate-900">
              No matching available flights
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {hasActiveFilters
                ? 'Try clearing or adjusting your flight number, origin, or destination filters.'
                : 'No flights currently have an Available status.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 h-10 px-4 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-sm font-medium transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Responsive Data Table */}
        {!error && !loading && filteredFlights.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th scope="col" className="py-3 px-5 whitespace-nowrap">
                    Flight Number
                  </th>
                  <th scope="col" className="py-3 px-5 whitespace-nowrap">
                    Origin
                  </th>
                  <th scope="col" className="py-3 px-5 whitespace-nowrap">
                    Destination
                  </th>
                  <th scope="col" className="py-3 px-5 whitespace-nowrap">
                    Departure
                  </th>
                  <th scope="col" className="py-3 px-5 whitespace-nowrap">
                    Arrival
                  </th>
                  <th scope="col" className="py-3 px-5 text-right whitespace-nowrap">
                    Available Seats
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredFlights.map((flight) => {
                  const isLowSeats = flight.availableSeats <= 15;
                  return (
                    <tr
                      key={flight.flightNumber}
                      className="hover:bg-sky-50/50 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {flight.flightNumber}
                      </td>
                      <td className="py-3.5 px-5 text-slate-800 whitespace-nowrap">
                        {flight.origin}
                      </td>
                      <td className="py-3.5 px-5 text-slate-800 whitespace-nowrap">
                        {flight.destination}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-slate-700 tabular-nums whitespace-nowrap">
                        {flight.departureTime}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-slate-700 tabular-nums whitespace-nowrap">
                        {flight.arrivalTime}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono tabular-nums whitespace-nowrap">
                        <span
                          className={
                            isLowSeats
                              ? 'font-semibold text-amber-700'
                              : 'font-semibold text-emerald-700'
                          }
                        >
                          {flight.availableSeats}
                        </span>
                        <span className="ml-1.5 text-xs font-sans text-slate-500">
                          {isLowSeats ? 'seats (Low)' : 'seats'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
