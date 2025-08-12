import { useState, useEffect } from "react";
import {
  FilePlus2,
  Copy,
  RefreshCcw,
  Mail,
  KeyRound,
  Building2,
  CreditCard,
  Star,
} from "lucide-react";
import { PLAN_DATA } from "../constants";

const CreateApplicationForm = ({
  onSubmit,
  externalKey,
  setExternalKey,
  onCopyKey,
}) => {
  const [formData, setFormData] = useState({
    applicationName: "Joe's Spaceage Stereo - Vermont",
    planId: "",
    abaRouting: "021000021",
    email: "",
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, planId: "115593" }));
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, externalKey });
  };

  const generateNewKey = () => {
    setExternalKey("EXT" + Math.floor(Math.random() * 1e14));
  };

  return (
    <div className="bg-gray-800/70 backdrop-blur rounded-2xl p-5 sm:p-6 border border-white/10 shadow-lg">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <FilePlus2 className="h-5 w-5 text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold">Create New Application</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Application Name */}
          <div>
            <label
              htmlFor="applicationName"
              className="block text-gray-300 mb-1"
            >
              Application Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                id="applicationName"
                value={formData.applicationName}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 bg-gray-900/60 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* External Key + actions */}
          <div>
            <label htmlFor="externalKey" className="block text-gray-300 mb-1">
              External Key
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  id="externalKey"
                  value={externalKey}
                  readOnly
                  className="w-full pl-10 pr-3 py-2 bg-gray-900/60 border border-white/10 rounded-lg text-white"
                />
              </div>
              <button
                type="button"
                onClick={onCopyKey}
                className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 border border-white/10 transition"
                aria-label="Copy external key"
                title="Copy"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={generateNewKey}
                className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 border border-white/10 transition"
                aria-label="Generate new external key"
                title="Generate new key"
              >
                <RefreshCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Plan ID */}
          <div>
            <label htmlFor="planId" className="block text-gray-300 mb-1">
              Plan
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <select
                id="planId"
                value={formData.planId}
                onChange={handleChange}
                className="w-full pl-10 pr-8 py-2 bg-gray-900/60 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">Select a Plan</option>
                {PLAN_DATA.planDetails.map((plan) => (
                  <option key={plan.planId} value={plan.planId}>
                    {plan.isFavoritePlan ? "★ " : ""}
                    {plan.planName} (ID: {plan.planId})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {`Tip: Favorites are marked with `}
              <Star className="inline h-3 w-3 -mt-0.5 text-yellow-300" />.
            </p>
          </div>

          {/* ABA Routing */}
          <div>
            <label htmlFor="abaRouting" className="block text-gray-300 mb-1">
              ABA Routing Number
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                id="abaRouting"
                value={formData.abaRouting}
                onChange={handleChange}
                inputMode="numeric"
                pattern="\d{9}"
                title="9-digit routing number"
                className="w-full pl-10 pr-3 py-2 bg-gray-900/60 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Enter 9 digits (e.g., 021000021).
            </p>
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-gray-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email for application notifications"
              className="w-full pl-10 pr-3 py-2 bg-gray-900/60 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow transition"
        >
          <FilePlus2 className="h-4 w-4" />
          Create Application
        </button>
      </form>
    </div>
  );
};

export default CreateApplicationForm;
