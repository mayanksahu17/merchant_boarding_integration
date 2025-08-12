import React from "react";
import {
  Eye,
  Link2,
  FileDown,
  Send,
  Trash2,
  KeyRound,
  CalendarClock,
  Copy,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

const statusStyle = (status = "") => {
  const s = status.toLowerCase();
  if (["approved", "verified", "accepted"].includes(s))
    return "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30";
  if (["submitted", "in-review", "underwriting"].includes(s))
    return "bg-blue-500/10 text-blue-300 ring-blue-500/30";
  if (["pending", "draft"].includes(s))
    return "bg-amber-500/10 text-amber-300 ring-amber-500/30";
  if (["rejected", "failed"].includes(s))
    return "bg-rose-500/10 text-rose-300 ring-rose-500/30";
  return "bg-slate-500/10 text-slate-300 ring-slate-500/30";
};

const statusIcon = (status = "") => {
  const s = status.toLowerCase();
  if (["approved", "verified", "accepted"].includes(s))
    return <CheckCircle2 className="w-4 h-4" />;
  if (["submitted", "in-review", "underwriting"].includes(s))
    return <Clock className="w-4 h-4" />;
  if (["rejected", "failed"].includes(s))
    return <AlertTriangle className="w-4 h-4" />;
  return <Clock className="w-4 h-4" />;
};

const ActionButton = ({ onClick, title, label, Icon, className = "" }) => (
  <button
    onClick={onClick}
    title={title || label}
    className={
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium " +
      "ring-1 ring-inset transition-colors shadow-sm " +
      className
    }
  >
    <Icon className="w-4 h-4" />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const ApplicationCard = ({
  application,
  onDelete,
  onSubmit,
  onView,
  onGenerateLink,
  onDownloadPDF,
}) => {
  const name = application?.applicationName || "Unnamed Application";
  const key = application?.externalKey || "—";
  const status = application?.status || "Pending";
  const created = application?.createdAt
    ? new Date(application.createdAt)
    : null;
  const createdText = created ? created.toLocaleString() : "Unknown date";

  const copyKey = () => {
    if (key && key !== "—") {
      navigator.clipboard?.writeText(key);
    }
  };

  return (
    <div
      className="
        group relative overflow-hidden rounded-xl
        bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900
        ring-1 ring-white/10 shadow-lg
        hover:ring-blue-500/30 hover:shadow-blue-500/10 transition
      "
    >
      {/* Top border accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 opacity-80" />

      <div className="p-4 md:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="text-lg md:text-xl font-semibold text-white truncate">
              {name}
            </h4>

            {/* Meta row */}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              <span
                className={
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 " +
                  "ring-1 " +
                  statusStyle(status)
                }
                title={`Status: ${status}`}
              >
                {statusIcon(status)}
                <span className="font-medium">{status}</span>
              </span>

              <span className="inline-flex items-center gap-2 text-slate-300">
                <KeyRound className="w-4 h-4 text-slate-400" />
                <span className="font-mono">{key}</span>
                <button
                  onClick={copyKey}
                  title="Copy key"
                  className="inline-flex items-center rounded-md px-1.5 py-0.5 text-slate-300 hover:text-white hover:bg-slate-700/60 transition"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </span>

              <span className="inline-flex items-center gap-2 text-slate-400">
                <CalendarClock className="w-4 h-4" />
                <span>{createdText}</span>
              </span>
            </div>
          </div>

          {/* Primary quick action (View) */}
          <ActionButton
            onClick={() => onView && onView(key)}
            label="View"
            title="View Application"
            Icon={Eye}
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 ring-slate-600/40"
          />
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-gradient-to-r from-transparent via-slate-600/40 to-transparent" />

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <ActionButton
            onClick={() => onGenerateLink && onGenerateLink(key)}
            label="Link"
            title="Generate Link"
            Icon={Link2}
            className="bg-blue-600 hover:bg-blue-700 text-white ring-blue-400/30"
          />
          <ActionButton
            onClick={() => onDownloadPDF && onDownloadPDF(key)}
            label="PDF"
            title="Download PDF"
            Icon={FileDown}
            className="bg-violet-600 hover:bg-violet-700 text-white ring-violet-400/30"
          />
          <ActionButton
            onClick={() => onSubmit && onSubmit(key)}
            label="Submit"
            title="Submit to Underwriting"
            Icon={Send}
            className="bg-amber-600 hover:bg-amber-700 text-white ring-amber-400/30"
          />
          <ActionButton
            onClick={() => onDelete && onDelete(key)}
            label="Delete"
            title="Delete Application"
            Icon={Trash2}
            className="bg-rose-600 hover:bg-rose-700 text-white ring-rose-400/30"
          />
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;
