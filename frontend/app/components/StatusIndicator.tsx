import React from 'react';
import { APPLICATION_STATUSES } from '../utils/constants';

const statusClasses = {
  [APPLICATION_STATUSES.PENDING]: 'bg-yellow-500 text-black',
  [APPLICATION_STATUSES.SUBMITTED]: 'bg-purple-600 text-white',
  [APPLICATION_STATUSES.VALIDATED]: 'bg-green-500 text-white',
  [APPLICATION_STATUSES.ERROR]: 'bg-red-500 text-white',
  [APPLICATION_STATUSES.UNDERWRITING]: 'bg-blue-500 text-white',
  [APPLICATION_STATUSES.APPROVED]: 'bg-green-600 text-white',
  [APPLICATION_STATUSES.REJECTED]: 'bg-red-600 text-white'
};

const StatusIndicator: React.FC<{ status: string }> = ({ status }) => {
  return (
    <span className={`${statusClasses[status] || 'bg-gray-500'} text-xs font-semibold px-3 py-1 rounded-full uppercase`}>
      {status}
    </span>
  );
};

export default StatusIndicator;