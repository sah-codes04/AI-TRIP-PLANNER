import React from "react";
import ThemeToggle from "@/components/custom/ThemeToggle";
import { toast } from "sonner";

function Settings() {
  const handleClearSavedData = () => {
    const shouldClear = window.confirm(
      "Clear saved sign-in and preferences from this browser?"
    );

    if (!shouldClear) {
      return;
    }

    ["user", "theme", "preferred_currency"].forEach((key) =>
      localStorage.removeItem(key)
    );
    window.dispatchEvent(new Event("user-updated"));
    toast.success("Saved app data cleared.");
  };

  return (
    <div className="mx-auto mt-10 max-w-3xl px-5 text-[color:var(--color-text)] sm:px-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="mt-6 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Theme</h2>
            <p className="text-sm text-[color:var(--color-muted)]">
              Switch between light and dark mode.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Clear Saved Data</h2>
            <p className="text-sm text-[color:var(--color-muted)]">
              Remove saved sign-in and local app preferences on this device.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearSavedData}
            className="rounded-md border border-[color:var(--color-border)] px-4 py-2 text-sm font-medium text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-surface-hover)]"
          >
            Clear Data
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
