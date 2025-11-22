import { Show, createSignal } from "solid-js";
import type { Component } from "solid-js";
import { addParticipant } from "@/lib/tournament/store";

const AddParticipantForm: Component = () => {
  const [name, setName] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    const value = name().trim();

    if (value.length === 0) {
      setError("Enter a participant name");
      return;
    }

    const created = addParticipant({ name: value });

    if (!created) {
      setError("Select a format before adding participants.");
      return;
    }

    setName("");
    setError(null);
  };

  return (
    <form
      class="space-y-2 rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-soft"
      onSubmit={handleSubmit}
      data-testid="add-participant-form"
      noValidate
    >
      <div class="flex items-center justify-between gap-3">
        <label for="participant-name" class="text-sm font-semibold text-neutral-900">
          Add participant
        </label>
        <span class="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
          Requirement 3.1
        </span>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div class="flex-1">
          <input
            id="participant-name"
            name="participant-name"
            type="text"
            class="input w-full"
            placeholder="e.g., Team Horizon"
            value={name()}
            onInput={(event) => setName(event.currentTarget.value)}
            aria-invalid={error() ? "true" : "false"}
            aria-describedby={error() ? "participant-name-error" : undefined}
          />
        </div>
        <button
          type="submit"
          class="btn btn-primary"
          aria-label="Add participant"
        >
          Add
        </button>
      </div>

      <Show when={error()}>
        {(message) => (
          <p
            id="participant-name-error"
            class="text-xs font-semibold text-danger"
            role="alert"
          >
            {message()}
          </p>
        )}
      </Show>
    </form>
  );
};

export default AddParticipantForm;
