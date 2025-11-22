import { createMemo } from "solid-js";
import type { Component } from "solid-js";
import {
  getStepNavigationSnapshot,
  goToNextStep,
  goToPreviousStep,
} from "@/lib/tournament/navigation";
import { tournamentState } from "@/lib/tournament/store";

const StepNavigation: Component = () => {
  const navigation = createMemo(() =>
    getStepNavigationSnapshot(tournamentState.step),
  );

  const handleBack = () => {
    goToPreviousStep();
  };

  const handleNext = () => {
    goToNextStep();
  };

  return (
    <nav
      class="card border-brand-100 bg-white/95 p-4 shadow-soft sm:p-5"
      aria-label="Builder step navigation"
      data-testid="step-navigation"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-1">
          <p class="text-xs font-semibold uppercase tracking-wide text-brand-700">
            Step navigation
          </p>
          <p class="text-sm text-neutral-700">
            Requirement 2.2: move backward or forward without losing your place in the
            guided builder flow.
          </p>
          <p class="text-sm font-semibold text-neutral-900">
            {navigation().currentTitle} · Step {navigation().currentIndex + 1} of{" "}
            {navigation().totalSteps}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            class="btn-secondary px-4 py-2"
            onClick={handleBack}
            disabled={!navigation().previous}
            aria-label={
              navigation().previousTitle
                ? `Go back to ${navigation().previousTitle}`
                : "Back is disabled on the first step"
            }
          >
            ← Back
          </button>
          <button
            type="button"
            class="btn-primary px-4 py-2"
            onClick={handleNext}
            disabled={!navigation().next}
            aria-label={
              navigation().nextTitle
                ? `Go forward to ${navigation().nextTitle}`
                : "Next is disabled on the final step"
            }
          >
            {navigation().nextTitle
              ? `Next: ${navigation().nextTitle}`
              : "You're on the final step"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default StepNavigation;
