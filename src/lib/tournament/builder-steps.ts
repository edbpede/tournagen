import type { BuilderStep } from "./store";

export interface BuilderStepDefinition {
  readonly id: BuilderStep;
  readonly title: string;
  readonly description: string;
}

export const builderSteps: readonly BuilderStepDefinition[] = [
  {
    id: "format-selection",
    title: "Choose a format",
    description: "Pick the tournament shape that fits your event.",
  },
  {
    id: "configuration",
    title: "Configure rules",
    description: "Adjust rounds, seeding, and format-specific options.",
  },
  {
    id: "participants",
    title: "Add participants",
    description: "Manage entrants, seeds, and optional metadata.",
  },
  {
    id: "review",
    title: "Review & export",
    description: "Preview structure, then export or save locally.",
  },
] as const;

export function findStepIndex(step: BuilderStep): number {
  return builderSteps.findIndex((definition) => definition.id === step);
}

export function getPreviousStep(step: BuilderStep): BuilderStep | null {
  const currentIndex = findStepIndex(step);
  if (currentIndex <= 0) {
    return null;
  }
  return builderSteps[currentIndex - 1]?.id ?? null;
}

export function getNextStep(step: BuilderStep): BuilderStep | null {
  const currentIndex = findStepIndex(step);
  if (currentIndex === -1 || currentIndex >= builderSteps.length - 1) {
    return null;
  }
  return builderSteps[currentIndex + 1]?.id ?? null;
}
