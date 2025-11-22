import { createMemo } from "solid-js";
import type { Component } from "solid-js";
import {
  builderSteps,
  findStepIndex,
  getNextStep,
  getPreviousStep,
} from "@/lib/tournament/builder-steps";
import { setCurrentStep, tournamentState } from "@/lib/tournament/store";

const StepNavigation: Component = () => {
  const currentIndex = createMemo(() => findStepIndex(tournamentState.step));
  const currentStep = createMemo(
    () => builderSteps[currentIndex()] ?? builderSteps[0],
  );
  const previousStep = createMemo(() => getPreviousStep(tournamentState.step));
  const previousStepTitle = createMemo(() => {
    const prev = previousStep();
    if (!prev) {
      return null;
    }
    const index = findStepIndex(prev);
    return builderSteps[index]?.title ?? prev;
  });
  const nextStep = createMemo(() => getNextStep(tournamentState.step));
  const nextStepTitle = createMemo(() => {
    const next = nextStep();
    if (!next) {
      return null;
    }
    const index = findStepIndex(next);
    return builderSteps[index]?.title ?? next;
  });

  const handleBack = () => {
    const targetStep = previousStep();
    if (!targetStep) {
      return;
    }
    setCurrentStep(targetStep);
  };

  const handleNext = () => {
    const targetStep = nextStep();
    if (!targetStep) {
      return;
    }
    setCurrentStep(targetStep);
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
            {currentStep().title} · Step {currentIndex() + 1} of {builderSteps.length}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            class="btn-secondary px-4 py-2"
            onClick={handleBack}
            disabled={!previousStep()}
            aria-label={
              previousStepTitle()
                ? `Go back to ${previousStepTitle()}`
                : "Back is disabled on the first step"
            }
          >
            ← Back
          </button>
          <button
            type="button"
            class="btn-primary px-4 py-2"
            onClick={handleNext}
            disabled={!nextStep()}
            aria-label={
              nextStepTitle()
                ? `Go forward to ${nextStepTitle()}`
                : "Next is disabled on the final step"
            }
          >
            {nextStepTitle()
              ? `Next: ${nextStepTitle()}`
              : "You're on the final step"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default StepNavigation;
