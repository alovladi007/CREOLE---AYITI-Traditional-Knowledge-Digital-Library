'use client';

import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardData {
  eventsByType: { type: string; count: number }[];
  dailyActivity: { date: string; count: number }[];
  topRecords: { record_id: string; view_count: number }[];
  uniqueUsers: number;
}

interface Props {
  data: DashboardData;
}

export function AnalyticsDashboard({ data }: Props) {
  const eventTypeData = {
    labels: data.eventsByType.map(e => e.type),
    datasets: [{
      label: 'Events',
      data: data.eventsByType.map(e => e.count),
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
      ]
    }]
  };

  const dailyActivityData = {
    labels: data.dailyActivity.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [{
      label: 'Daily Activity',
      data: data.dailyActivity.map(d => d.count),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1
    }]
  };

  const topRecordsData = {
    labels: data.topRecords.map((_, i) => `Record ${i + 1}`),
    datasets: [{
      label: 'Views',
      data: data.topRecords.map(r => r.view_count),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
    }]
  };

  return (
    <div className="analytics-dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Unique Users</h3>
          <p className="stat-value">{data.uniqueUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Events</h3>
          <p className="stat-value">
            {data.eventsByType.reduce((sum, e) => sum + e.count, 0)}
          </p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Event Distribution</h3>
          <Pie data={eventTypeData} />
        </div>

        <div className="chart-container">
          <h3>Daily Activity (Last 30 Days)</h3>
          <Line data={dailyActivityData} />
        </div>

        <div className="chart-container">
          <h3>Top Viewed Records</h3>
          <Bar data={topRecordsData} />
        </div>
      </div>
    </div>
  );
}
