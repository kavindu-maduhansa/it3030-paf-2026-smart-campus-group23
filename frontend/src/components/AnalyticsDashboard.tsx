import React, { useState } from 'react';
import { TopResourcesChart } from './TopResourcesChart';
import { PeakHoursChart } from './PeakHoursChart';
import { BookingsByTypeChart } from './BookingsByTypeChart';
import '../index.css';

export const AnalyticsDashboard: React.FC = () => {
  const [limit] = useState(15);

  return (
    <div className="w-full min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B82F6] mb-2">Analytics</p>
          <h1 className="text-4xl font-bold text-white mb-2">Usage Analytics</h1>
          <p className="text-[#94A3B8]">Resource booking statistics and usage patterns</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Resources Chart */}
          <div className="lg:col-span-2">
            <TopResourcesChart limit={limit} />
          </div>

          {/* Peak Hours Chart */}
          <div className="lg:col-span-1">
            <PeakHoursChart />
          </div>

          {/* Bookings by Type Chart */}
          <div className="lg:col-span-1">
            <BookingsByTypeChart />
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-4 shadow-lg shadow-black/30">
          <h3 className="font-bold text-white mb-3">📊 Dashboard Information</h3>
          <ul className="text-sm text-[#94A3B8] space-y-2">
            <li>• <span className="text-[#93C5FD]">Top Resources</span>: Shows the most frequently booked facilities</li>
            <li>• <span className="text-[#93C5FD]">Peak Hours</span>: Displays the busiest booking hours of the day</li>
            <li>• <span className="text-[#93C5FD]">Bookings by Type</span>: Breakdown of bookings across different resource types</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
