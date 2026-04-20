import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';
import type { TopResource } from '../services/analyticsService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import '../index.css';

interface TopResourcesChartProps {
  limit?: number;
}

export const TopResourcesChart: React.FC<TopResourcesChartProps> = ({ limit = 15 }) => {
  const [data, setData] = useState<TopResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const results = await analyticsService.getTopResources(limit);
        setData(results);
        setError(null);
      } catch (err) {
        console.error('Failed to load top resources:', err);
        setError('Failed to load top resources data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [limit]);

  if (loading) {
    return <div className="p-4">Loading top resources...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  if (data.length === 0) {
    return <div className="p-4 text-gray-600">No booking data available</div>;
  }

  return (
    <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-lg shadow-black/30">
      <h2 className="text-2xl font-bold mb-6 text-white">Top Resources by Bookings</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis
            dataKey="resourceName"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fill: '#94A3B8', fontSize: 12 }}
          />
          <YAxis label={{ value: 'Booking Count', angle: -90, position: 'insideLeft', fill: '#94A3B8' }} tick={{ fill: '#94A3B8' }} />
          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #3B82F6', borderRadius: '8px', color: '#fff' }} />
          <Legend wrapperStyle={{ color: '#94A3B8' }} />
          <Bar dataKey="bookingCount" fill="#3B82F6" name="Bookings" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((resource) => (
          <div key={resource.resourceId} className="rounded-xl border border-[#1F2937] bg-[#0F172A]/80 p-4">
            <div className="font-semibold text-white">{resource.resourceName}</div>
            <div className="text-sm text-[#94A3B8] mt-1">
              Type: {resource.resourceType} | Location: {resource.location}
            </div>
            <div className="text-lg font-bold text-[#3B82F6] mt-2">
              {resource.bookingCount} bookings
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
