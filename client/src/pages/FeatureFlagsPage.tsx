import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { organizationService } from "../services/organizationService";
import type { FeatureFlags } from "../types/models";
import { isPrivilegedRole } from "../utils/permissions";

export const FeatureFlagsPage = () => {
  const { organization, setOrganizationState, user } = useAuth();
  const [flags, setFlags] = useState<FeatureFlags>(
    organization?.featureFlags ?? {
      scheduling: false,
      advancedReports: false,
      customBranding: false
    }
  );
  const [status, setStatus] = useState<string | null>(null);
  const canEdit = isPrivilegedRole(user?.role);

  const handleSave = async () => {
    setStatus(null);

    try {
      const nextOrganization = await organizationService.updateFeatureFlags(flags);
      setOrganizationState(nextOrganization);
      setFlags(nextOrganization.featureFlags);
      setStatus("Feature flags updated.");
    } catch (saveError) {
      setStatus(saveError instanceof Error ? saveError.message : "Unable to update flags");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        description="Control which product areas are available for the current organization."
        title="Feature flags"
      />
      <div className="max-w-3xl rounded-3xl bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {Object.entries(flags).map(([flagKey, enabled]) => (
            <label
              className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4"
              key={flagKey}
            >
              <div>
                <p className="font-medium text-ink">{flagKey.replace(/([A-Z])/g, " $1")}</p>
                <p className="text-sm text-slate-500">
                  Toggle organization access for this feature area.
                </p>
              </div>
              <input
                checked={enabled}
                className="h-5 w-5 accent-brand"
                disabled={!canEdit}
                onChange={(event) =>
                  setFlags((current) => ({
                    ...current,
                    [flagKey]: event.target.checked
                  }))
                }
                type="checkbox"
              />
            </label>
          ))}
        </div>
        {status ? <p className="mt-4 text-sm text-slate-600">{status}</p> : null}
        <button
          className="mt-6 rounded-2xl bg-ink px-4 py-3 font-medium text-white disabled:bg-slate-300"
          disabled={!canEdit}
          onClick={() => void handleSave()}
          type="button"
        >
          {canEdit ? "Save flags" : "Owners and admins only"}
        </button>
      </div>
    </div>
  );
};
