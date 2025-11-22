import { Show } from "solid-js";
import type { Component } from "solid-js";
import ParticipantList from "./ParticipantList";
import AddParticipantForm from "./AddParticipantForm";
import { currentFormat } from "@/lib/tournament/store";

const ParticipantManager: Component = () => {
  const format = currentFormat;

  return (
    <div class="space-y-4" data-testid="participant-manager">
      <div class="flex items-start justify-between gap-3 rounded-lg border border-neutral-100 bg-neutral-50 px-4 py-3">
        <div class="space-y-1">
          <p class="text-xs font-semibold uppercase tracking-wide text-neutral-600">
            Participants stay reactive
          </p>
          <p class="text-sm text-neutral-700">
            Names, seeds, and optional details render with Solid control-flow
            components so only the changed row updates.
          </p>
        </div>
        <span class="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
          Uses &lt;For&gt; lists
        </span>
      </div>

      <Show
        when={format()}
        fallback={
          <div class="rounded-lg border border-dashed border-neutral-200 bg-white px-4 py-6 text-sm text-neutral-700">
            Select a format first to start managing participants. The list will
            hydrate immediately once a configuration is active.
          </div>
        }
      >
        <div class="space-y-4">
          <AddParticipantForm />
          <ParticipantList />
        </div>
      </Show>
    </div>
  );
};

export default ParticipantManager;
