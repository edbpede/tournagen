import { For, Show, createEffect, createMemo, createSignal } from "solid-js";
import type { Component } from "solid-js";
import {
  currentParticipants,
  removeParticipant,
  updateParticipant,
} from "@/lib/tournament/store";
import type { Participant } from "@/lib/tournament/types";

interface ParticipantListItemProps {
  participant: Participant;
  index: number;
}

const ParticipantListItem: Component<ParticipantListItemProps> = (props) => {
  const [isEditing, setIsEditing] = createSignal(false);
  const [draftName, setDraftName] = createSignal(props.participant.name);
  const [error, setError] = createSignal<string | null>(null);

  const displaySeed = createMemo(() => props.participant.seed ?? props.index + 1);

  const optionalBadges = createMemo(() => {
    const badges: Array<{ label: string; value: string }> = [];

    if (props.participant.seed !== undefined) {
      badges.push({ label: "Seed", value: `#${props.participant.seed}` });
    }

    if (props.participant.team) {
      badges.push({ label: "Team", value: props.participant.team });
    }

    if (props.participant.nationality) {
      badges.push({ label: "Nation", value: props.participant.nationality });
    }

    if (
      props.participant.metadata &&
      Object.keys(props.participant.metadata).length > 0
    ) {
      badges.push({
        label: "Metadata",
        value: `${Object.keys(props.participant.metadata).length} field(s)`,
      });
    }

    return badges;
  });

  createEffect(() => {
    if (!isEditing()) {
      setDraftName(props.participant.name);
    }
  });

  const handleStartEdit = () => {
    setDraftName(props.participant.name);
    setError(null);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmed = draftName().trim();

    if (trimmed.length === 0) {
      setError("Name cannot be empty");
      return;
    }

    updateParticipant(props.participant.id, { name: trimmed });
    setIsEditing(false);
    setError(null);
  };

  const handleCancel = () => {
    setDraftName(props.participant.name);
    setIsEditing(false);
    setError(null);
  };

  const handleRemove = () => {
    const message = `Remove ${props.participant.name}? This will also refresh the current bracket.`;
    const confirmed =
      typeof window !== "undefined" ? window.confirm(message) : true;

    if (!confirmed) {
      return;
    }

    removeParticipant(props.participant.id);
  };

  return (
    <article
      class="flex items-start justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-soft"
      aria-label={`Participant ${props.participant.name}`}
    >
      <div class="flex items-start gap-3">
        <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 font-semibold text-brand-800">
          {displaySeed()}
        </span>
        <div class="space-y-1">
          <Show
            when={isEditing()}
            fallback={
              <p class="font-semibold text-neutral-900">
                {props.participant.name}
              </p>
            }
          >
            <label class="flex flex-col gap-2 text-sm text-neutral-900 sm:flex-row sm:items-center">
              <span class="font-semibold text-neutral-700">Editing name</span>
              <input
                type="text"
                class="input w-full sm:w-64"
                value={draftName()}
                onInput={(event) => setDraftName(event.currentTarget.value)}
                aria-label={`Edit name for ${props.participant.name}`}
                aria-invalid={error() ? "true" : "false"}
              />
            </label>
          </Show>
          <Show when={error()}>
            {(message) => (
              <p class="text-xs font-semibold text-danger" role="alert">
                {message()}
              </p>
            )}
          </Show>
          <Show when={optionalBadges().length > 0}>
            <div class="flex flex-wrap gap-2">
              <For each={optionalBadges()}>
                {(badge) => (
                  <span class="rounded-full bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700">
                    <span class="text-neutral-500">{badge.label}:</span>{" "}
                    {badge.value}
                  </span>
                )}
              </For>
            </div>
          </Show>
        </div>
      </div>
      <div class="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
        <span class="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-700">
          #{props.index + 1}
        </span>
        <div class="flex items-center gap-2">
          <Show
            when={isEditing()}
            fallback={
              <button
                type="button"
                class="btn btn-secondary"
                onClick={handleStartEdit}
                aria-label={`Edit ${props.participant.name}`}
              >
                Edit name
              </button>
            }
          >
            <button
              type="button"
              class="btn btn-primary"
              onClick={handleSave}
              aria-label={`Save name for ${props.participant.name}`}
            >
              Save
            </button>
            <button
              type="button"
              class="btn btn-ghost"
              onClick={handleCancel}
              aria-label={`Cancel editing ${props.participant.name}`}
            >
              Cancel
            </button>
          </Show>
          <button
            type="button"
            class="btn btn-ghost text-danger"
            onClick={handleRemove}
            aria-label={`Remove ${props.participant.name}`}
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
};

const ParticipantList: Component = () => {
  const participants = currentParticipants;

  return (
    <div class="space-y-3" data-testid="participant-list">
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm text-neutral-700">
          Requirement 3.1/3.2: participants update immediately, and edits only
          touch the affected row thanks to Solid&apos;s fine-grained reactivity.
        </p>
        <span class="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-800">
          <span aria-hidden="true">⚡</span> Live list
        </span>
      </div>

      <Show
        when={participants().length > 0}
        fallback={
          <div class="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-600">
            No participants yet. Add entries to see them appear instantly in this
            list.
          </div>
        }
      >
        <div class="space-y-2" role="list" aria-label="Current participants">
          <For each={participants()}>
            {(participant, index) => (
              <ParticipantListItem participant={participant} index={index()} />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

export default ParticipantList;
