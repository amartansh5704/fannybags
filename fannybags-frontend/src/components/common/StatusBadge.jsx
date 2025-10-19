export default function StatusBadge({ status }) {
  const getStatusStyle = (status) => {
    const statusMap = {
      active: {
        bgColor: 'bg-green-900',
        textColor: 'text-green-200',
        label: 'Active',
        icon: '🔴'
      },
      upcoming: {
        bgColor: 'bg-blue-900',
        textColor: 'text-blue-200',
        label: 'Upcoming',
        icon: '⏳'
      },
      closed: {
        bgColor: 'bg-gray-700',
        textColor: 'text-gray-300',
        label: 'Closed',
        icon: '🔒'
      },
      successful: {
        bgColor: 'bg-emerald-900',
        textColor: 'text-emerald-200',
        label: 'Successful',
        icon: '✅'
      },
      failed: {
        bgColor: 'bg-red-900',
        textColor: 'text-red-200',
        label: 'Failed',
        icon: '❌'
      }
    };

    return statusMap[status.toLowerCase()] || statusMap.active;
  };

  const style = getStatusStyle(status);

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${style.bgColor} ${style.textColor}`}>
      {style.icon} {style.label}
    </span>
  );
}