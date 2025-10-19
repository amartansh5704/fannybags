import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RevenueChart({ campaign }) {
  const expectedRevenue = campaign.expected_revenue_3m || 0;
  const actualRevenue = campaign.actual_revenue || 0;

  const data = {
    labels: ['Expected Revenue', 'Actual Revenue'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: [expectedRevenue, actualRevenue],
        backgroundColor: ['#FF48B9', '#00FF88'],
        borderColor: ['#FF48B9', '#00FF88'],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'white',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  return (
    <div className="bg-fb-surface p-6 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Revenue Comparison</h3>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}