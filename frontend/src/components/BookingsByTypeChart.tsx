import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';
import type { BookingsByType } from '../services/analyticsService';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import '../index.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const BookingsByTypeChart: React.FC = () => {
  const [data, setData] = useState<BookingsByType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const results = await analyticsService.getBookingsByResourceType();
        setData(results);
        setError(null);
      } catch (err) {
        console.error('Failed to load bookings by type:', err);
        setError('Failed to load bookings by type data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4">Loading bookings by type...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  if (data.length === 0) {
    return <div className="p-4 text-gray-600">No booking data available</div>;
  }

  const total = data.reduce((sum, item) => sum + item.bookingCount, 0);

  return (
    <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-lg shadow-black/30">
      <h2 className="text-2xl font-bold mb-6 text-white">Bookings by Resource Type</h2>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props: any) => `${props.payload.type}: ${props.payload.bookingCount}`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="bookingCount"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} bookings`, 'Count']} contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #3B82F6', borderRadius: '8px', color: '#fff' }} />
          <Legend wrapperStyle={{ color: '#94A3B8' }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-[#3B82F6]/50 rounded-xl bg-[#3B82F6]/15">
          <div className="text-sm text-[#93C5FD]">Total Bookings</div>
          <div className="text-3xl font-bold text-[#3B82F6] mt-2">{total}</div>
        </div>
        <div className="p-4 border border-[#1F2937] rounded-xl bg-[#0F172A]/80">
          <div className="text-sm font-semibold text-[#93C5FD] mb-3">Breakdown by Type</div>
          {data.map((item, index) => (
            <div key={item.type} className="flex items-center mb-2">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <span className="text-sm text-[#94A3B8]">{item.type}</span>
              <span className="ml-auto font-semibold text-[#3B82F6]">{item.bookingCount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
