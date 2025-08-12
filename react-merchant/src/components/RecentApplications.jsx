import { useState } from "react";
import { RefreshCcw, Loader2, FolderOpen } from "lucide-react";
import ApplicationCard from "./ApplicationCard";
import { downloadApplicationPDF } from "../services/api";

const RecentApplications = ({
  applications,
  onDelete,
  onSubmit,
  onView,
  onRefresh,
  onGenerateLink,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDownloadPDF = async (externalKey) => {
    setDownloadingPDF(true);
    try {
      await downloadApplicationPDF(externalKey);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      // TODO: surface a toast/status message if you have a global StatusDisplay
    } finally {
      setDownloadingPDF(false);
    }
  };

  const count = applications?.length || 0;

  return (
    <section className="bg-gray-800/70 backdrop-blur rounded-2xl p-5 sm:p-6 border border-white/10 shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            Recent Applications
            <span className="inline-flex items-center justify-center text-xs font-medium px-2 py-0.5 rounded-full bg-white/10 text-gray-200">
              {count}
            </span>
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">
            Review, submit, share links, or export as PDF.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg border border-white/10 transition disabled:opacity-60 disabled:cursor-not-allowed"
          title="Refresh (Ctrl/⌘+R)"
        >
          {isRefreshing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Refreshing…
            </>
          ) : (
            <>
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </>
          )}
        </button>
      </div>

      {/* Content */}
      {count === 0 ? (
        <div className="text-center py-10 rounded-xl border border-dashed border-white/10 bg-gray-900/40">
          <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-gray-800/80 flex items-center justify-center border border-white/10">
            <FolderOpen className="h-6 w-6 text-gray-400" />
          </div>
          <h4 className="text-lg text-gray-200 mb-1">No applications yet</h4>
          <p className="text-gray-500">
            Create your first application to see it here.
          </p>
        </div>
      ) : (
        // If your ApplicationCard is a full-width card, keep it stacked.
        // If it’s grid-friendly, uncomment the grid wrapper below.
        <div className="space-y-4">
          {/* For grid layout instead of stacked list:
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"> */}
          {applications.map((app) => (
            <ApplicationCard
              key={app.externalKey}
              application={app}
              onDelete={onDelete}
              onSubmit={onSubmit}
              onView={onView}
              onGenerateLink={onGenerateLink}
              onDownloadPDF={handleDownloadPDF}
              downloading={downloadingPDF}
            />
          ))}
          {/* </div> */}
        </div>
      )}
    </section>
  );
};

export default RecentApplications;
