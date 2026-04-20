import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';
import type { PeakHour } from '../services/analyticsService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import '../index.css';

export const PeakHoursChart: React.FC = () => {
  const [data, setData] = useState<PeakHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const results = await analyticsService.getPeakBookingHours();
        setData(results);
        setError(null);
      } catch (err) {
        console.error('Failed to load peak hours:', err);
        setError('Failed to load peak hours data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4">Loading peak hours...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  if (data.length === 0) {
    return <div className="p-4 text-gray-600">No booking data available</div>;
  }

  // Find peak hour
  const peakHour = data.reduce((max, current) =>
    current.bookingCount > max.bookingCount ? current : max
  );

  return (
    <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-lg shadow-black/30">
      <h2 className="text-2xl font-bold mb-6 text-white">Peak Booking Hours</h2>
      <div className="mb-6 p-4 border border-[#3B82F6]/50 rounded-xl bg-[#3B82F6]/15">
        <div className="text-sm text-[#93C5FD]">Busiest Time</div>
        <div className="text-2xl font-bold text-[#3B82F6] mt-1">
          {peakHour.timeLabel}
        </div>
        <div className="text-sm text-[#94A3B8] mt-1">
          {peakHour.bookingCount} bookings
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis
            dataKey="hour"
            tickFormatter={(hour) => `${hour}:00`}
            tick={{ fill: '#94A3B8', fontSize: 12 }}
          />
          <YAxis label={{ value: 'Booking Count', angle: -90, position: 'insideLeft', fill: '#94A3B8' }} tick={{ fill: '#94A3B8' }} />
          <Tooltip
            formatter={(value) => [value, 'Bookings']}
            labelFormatter={(label) => `${label}:00`}
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #3B82F6', borderRadius: '8px', color: '#fff' }}
          />
          <Legend wrapperStyle={{ color: '#94A3B8' }} />
          <Line
            type="monotone"
            dataKey="bookingCount"
            stroke="#3B82F6"
            name="Bookings"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-6 grid grid-cols-4 gap-2">
        {data.map((hour) => (
          <div key={hour.hour} className="p-2 border border-[#1F2937] rounded-lg text-center bg-[#0F172A]/80">
            <div className="text-xs text-[#94A3B8]">{hour.hour}:00</div>
            <div className="text-lg font-bold text-[#3B82F6] mt-1">{hour.bookingCount}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
