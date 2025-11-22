import {
  builderSteps,
  findStepIndex,
  getNextStep,
  getPreviousStep,
} from "./builder-steps";
import { setCurrentStep, tournamentState, type BuilderStep } from "./store";

export interface StepNavigationSnapshot {
  readonly current: BuilderStep;
  readonly currentTitle: string;
  readonly currentIndex: number;
  readonly totalSteps: number;
  readonly previous: BuilderStep | null;
  readonly previousTitle: string | null;
  readonly next: BuilderStep | null;
  readonly nextTitle: string | null;
}

function getStepTitle(step: BuilderStep | null): string | null {
  if (!step) {
    return null;
  }
  const definition = builderSteps.find(
    (builderStep) => builderStep.id === step,
  );
  return definition?.title ?? null;
}

export function getStepNavigationSnapshot(
  step: BuilderStep,
): StepNavigationSnapshot {
  const index = findStepIndex(step);
  const safeIndex = index >= 0 ? index : 0;
  const safeCurrent = builderSteps[safeIndex];
  const previous = getPreviousStep(step);
  const next = getNextStep(step);

  return {
    current: step,
    currentTitle: safeCurrent.title,
    currentIndex: safeIndex,
    totalSteps: builderSteps.length,
    previous,
    previousTitle: getStepTitle(previous),
    next,
    nextTitle: getStepTitle(next),
  };
}

export function goToPreviousStep(): BuilderStep | null {
  const target = getPreviousStep(tournamentState.step);
  if (!target) {
    return null;
  }
  setCurrentStep(target);
  return target;
}

export function goToNextStep(): BuilderStep | null {
  const target = getNextStep(tournamentState.step);
  if (!target) {
    return null;
  }
  setCurrentStep(target);
  return target;
}
