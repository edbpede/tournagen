import { For, createMemo } from "solid-js";
import type { Component } from "solid-js";
import type { BuilderStep } from "@/lib/tournament/store";
import { tournamentState } from "@/lib/tournament/store";

interface StepDefinition {
  readonly id: BuilderStep;
  readonly title: string;
  readonly description: string;
}

const steps: readonly StepDefinition[] = [
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
];

const BuilderProgress: Component<{ class?: string }> = (props) => {
  const currentIndex = createMemo(() =>
    steps.findIndex((step) => step.id === tournamentState.step),
  );

  const containerClass = () =>
    props.class ? `card p-4 sm:p-5 ${props.class}` : "card p-4 sm:p-5";

  return (
    <section
      class={containerClass()}
      aria-label="Tournament builder progress"
      data-testid="builder-progress"
    >
      <div class="flex items-center justify-between gap-3 pb-4 sm:pb-5">
        <div class="space-y-1">
          <p class="pill inline-flex bg-brand-50 text-brand-700">Stepwise flow</p>
          <h2 class="font-display text-2xl leading-tight text-neutral-900">
            Track your builder progress
          </h2>
          <p class="text-base text-neutral-700">
            Requirement 2.1: clearly indicate where you are in the guided setup.
          </p>
        </div>
        <div class="hidden sm:block text-sm font-semibold text-brand-700">
          Step {currentIndex() + 1} of {steps.length}
        </div>
      </div>

      <ol class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="list">
        <For each={steps}>
          {(step, index) => {
            const idx = index();
            const status = () => {
              const current = currentIndex();
              if (current === -1) {
                return "upcoming";
              }
              if (idx < current) {
                return "complete";
              }
              if (idx === current) {
                return "current";
              }
              return "upcoming";
            };

            const isCurrent = () => status() === "current";
            const isComplete = () => status() === "complete";

            return (
              <li
                class="relative flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white/90 p-4 shadow-soft"
                aria-current={isCurrent() ? "step" : undefined}
              >
                {idx < steps.length - 1 && (
                  <span class="pointer-events-none absolute right-[-12px] top-1/2 hidden h-px w-6 -translate-y-1/2 bg-neutral-200 lg:block" />
                )}
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold"
                    classList={{
                      "border-brand-200 bg-brand-600 text-white shadow-ring": isCurrent(),
                      "border-brand-200 bg-brand-50 text-brand-700": isComplete(),
                      "border-neutral-200 bg-neutral-50 text-neutral-600": !isCurrent() && !isComplete(),
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div class="space-y-1">
                    <p class="text-xs font-semibold uppercase tracking-wide text-neutral-600">
                      {step.title}
                    </p>
                    <p class="text-sm text-neutral-700">{step.description}</p>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span
                    class="rounded-full px-3 py-1 text-xs font-semibold"
                    classList={{
                      "bg-brand-50 text-brand-800 border border-brand-100": isCurrent(),
                      "bg-success/10 text-success border border-success/30":
                        isComplete(),
                      "bg-neutral-100 text-neutral-700 border border-neutral-200":
                        !isCurrent() && !isComplete(),
                    }}
                  >
                    {isComplete() ? "Completed" : isCurrent() ? "In progress" : "Pending"}
                  </span>
                  <span class="text-xs text-neutral-500">Step {idx + 1}</span>
                </div>
              </li>
            );
          }}
        </For>
      </ol>
    </section>
  );
};

export default BuilderProgress;
