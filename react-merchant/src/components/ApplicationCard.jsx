import { APPLICATION_STATUSES } from '../constants';

const ApplicationCard = ({ application, onDelete, onSubmit, onView }) => {
  const statusColor = {
    [APPLICATION_STATUSES.PENDING]: 'bg-yellow-500',
    [APPLICATION_STATUSES.SUBMITTED]: 'bg-blue-500',
    [APPLICATION_STATUSES.VALIDATED]: 'bg-green-500',
    [APPLICATION_STATUSES.ERROR]: 'bg-red-500',
    [APPLICATION_STATUSES.UNDERWRITING]: 'bg-purple-500',
    [APPLICATION_STATUSES.APPROVED]: 'bg-green-600',
    [APPLICATION_STATUSES.REJECTED]: 'bg-red-600',
  }[application.status] || 'bg-gray-500';

  return (
    <div className="bg-gray-800 shadow-3xl rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg font-medium text-white">{application.applicationName}</h4>
        <span className={`${statusColor} text-white text-xs px-2 py-1 rounded-full`}>
          {application.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-gray-400 text-sm">External Key</div>
          <div className="text-white">{application.externalKey}</div>
        </div>
        <div>
          <div className="text-gray-400 text-sm">Plan ID</div>
          <div className="text-white">{application.plan?.planId}</div>
        </div>
        <div>
          <div className="text-gray-400 text-sm">Email</div>
          <div className="text-white">{application.email || 'Not provided'}</div>
        </div>
        <div>
          <div className="text-gray-400 text-sm">Created</div>
          <div className="text-white">
            {new Date(application.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div>
          <div className="text-gray-400 text-sm">Last Updated</div>
          <div className="text-white">
            {new Date(application.updatedAt).toLocaleDateString()}
          </div>
        </div>
        {application.submittedAt && (
          <div>
            <div className="text-gray-400 text-sm">Submitted</div>
            <div className="text-white">
              {new Date(application.submittedAt).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {application.emailHistory?.length > 0 && (
        <div className="bg-gray-900 p-3 rounded-md mb-4">
          <div className="text-gray-400 text-sm mb-2">📧 Email History</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {application.emailHistory.slice(-3).map((email, idx) => (
              <div key={idx} className="text-gray-300 text-xs">
                {new Date(email.sentAt).toLocaleDateString()} - {email.type} {email.success ? '✅' : '❌'}
              </div>
            ))}
            {application.emailHistory.length > 3 && (
              <div className="text-gray-500 text-xs">
                +{application.emailHistory.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onView(application.externalKey)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
        >
          View Details
        </button>
        {(application.status === APPLICATION_STATUSES.PENDING || 
          application.status === APPLICATION_STATUSES.VALIDATED) && (
          <button
            onClick={() => onSubmit(application.externalKey)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
          >
            🚀 Submit
          </button>
        )}
        <button
          onClick={() => onDelete(application.externalKey)}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ApplicationCard;