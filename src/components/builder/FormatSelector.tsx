import { For, createMemo } from "solid-js";
import type { Component } from "solid-js";
import { tournamentFormatRegistry } from "@/lib/tournament/registry";
import { setCurrentFormat, tournamentState } from "@/lib/tournament/store";
import { TournamentFormatType } from "@/lib/tournament/types";

const FormatSelector: Component = () => {
  const formats = createMemo(() => tournamentFormatRegistry.getAll());
  const selectedType = createMemo(
    () => tournamentState.currentConfig?.formatType ?? null,
  );

  const handleSelect = (formatType: TournamentFormatType) => {
    setCurrentFormat(formatType, tournamentState.currentConfig?.participants ?? []);
  };

  return (
    <div class="space-y-4" data-testid="format-selector">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-neutral-700">
          Requirement 2.1: picking a format moves the builder into configuration while
          keeping the guided flow visible in the progress bar.
        </p>
        <span class="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
          Registry-driven options
        </span>
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <For each={formats()}>
          {(format) => {
            const isSelected = () => selectedType() === format.metadata.type;

            return (
              <button
                type="button"
                class="tournament-card flex h-full flex-col gap-3 p-5 text-left transition-all duration-200"
                classList={{
                  "border-brand-300 bg-brand-50/70 shadow-ring": isSelected(),
                }}
                aria-pressed={isSelected()}
                aria-label={`Select ${format.metadata.name} format`}
                onClick={() => handleSelect(format.metadata.type)}
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl" aria-hidden="true">
                      {format.metadata.icon}
                    </span>
                    <div class="space-y-1">
                      <p class="text-xs font-semibold uppercase tracking-wide text-brand-700">
                        Format
                      </p>
                      <p class="font-display text-lg text-neutral-900">
                        {format.metadata.name}
                      </p>
                    </div>
                  </div>
                  <span
                    class="rounded-full px-3 py-1 text-xs font-semibold"
                    classList={{
                      "bg-brand-600 text-white shadow-ring": isSelected(),
                      "bg-neutral-100 text-neutral-700": !isSelected(),
                    }}
                  >
                    {isSelected() ? "Selected" : "Choose"}
                  </span>
                </div>

                <p class="text-sm text-neutral-700">{format.metadata.description}</p>

                <div class="flex flex-wrap gap-2">
                  <For each={format.metadata.useCases}>
                    {(useCase) => (
                      <span class="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700">
                        {useCase}
                      </span>
                    )}
                  </For>
                </div>

                <div class="flex items-center justify-between pt-1 text-sm font-semibold text-brand-700">
                  <span>Click to load defaults</span>
                  <span aria-hidden="true">→</span>
                </div>
              </button>
            );
          }}
        </For>
      </div>
    </div>
  );
};

export default FormatSelector;
