import { ErrorBoundary } from "solid-js";
import type { Component, ParentComponent } from "solid-js";

interface IslandErrorBoundaryProps {
  readonly title?: string;
}

const IslandErrorBoundary: ParentComponent<IslandErrorBoundaryProps> = (props) => {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div class="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-danger-800">
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <p class="text-sm font-semibold">
                {props.title ?? "This section"} ran into a problem.
              </p>
              <p class="text-xs text-danger-700">
                {error instanceof Error ? error.message : String(error)}
              </p>
            </div>
            <button
              type="button"
              class="btn btn-secondary text-danger-800"
              onClick={() => reset?.()}
            >
              Retry
            </button>
          </div>
        </div>
      )}
    >
      {props.children}
    </ErrorBoundary>
  );
};

export default IslandErrorBoundary;
