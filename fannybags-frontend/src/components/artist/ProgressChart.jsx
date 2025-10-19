import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function ProgressChart({ campaign }) {
  const totalRaised = campaign.amount_raised || 0;
  const targetAmount = campaign.target_amount || 1;
  const remaining = Math.max(0, targetAmount - totalRaised);

  const data = {
    labels: ['Raised', 'Remaining'],
    datasets: [
      {
        data: [totalRaised, remaining],
        backgroundColor: ['#FF48B9', '#374151'],
        borderColor: ['#FF48B9', '#374151'],
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
  };

  return (
    <div className="bg-fb-surface p-6 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Funding Progress</h3>
      <div className="h-64">
        <Doughnut data={data} options={options} />
      </div>
      <div className="mt-4 text-center">
        <p className="text-2xl font-bold text-fb-pink">
          {((totalRaised / targetAmount) * 100).toFixed(1)}%
        </p>
        <p className="text-gray-400">of target reached</p>
      </div>
    </div>
  );
}