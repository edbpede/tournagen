import { Show, createSignal } from "solid-js";
import type { Component } from "solid-js";
import { addParticipant } from "@/lib/tournament/store";

const AddParticipantForm: Component = () => {
  const [name, setName] = createSignal("");
  const [seed, setSeed] = createSignal("");
  const [team, setTeam] = createSignal("");
  const [nationality, setNationality] = createSignal("");
  const [metadata, setMetadata] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    const value = name().trim();

    if (value.length === 0) {
      setError("Enter a participant name");
      return;
    }

    const seedValue = seed().trim();
    let parsedSeed: number | undefined;

    if (seedValue.length > 0) {
      const numericSeed = Number(seedValue);
      if (!Number.isInteger(numericSeed) || numericSeed <= 0) {
        setError("Seed must be a positive integer");
        return;
      }
      parsedSeed = numericSeed;
    }

    const teamValue = team().trim();
    const nationalityValue = nationality().trim();

    const metadataValue = metadata().trim();
    let parsedMetadata: Record<string, unknown> | undefined;

    if (metadataValue.length > 0) {
      try {
        const parsed = JSON.parse(metadataValue);
        if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
          setError("Metadata must be a JSON object");
          return;
        }
        parsedMetadata = parsed as Record<string, unknown>;
      } catch {
        setError("Metadata must be valid JSON");
        return;
      }
    }

    const created = addParticipant({
      name: value,
      seed: parsedSeed,
      team: teamValue.length > 0 ? teamValue : undefined,
      nationality: nationalityValue.length > 0 ? nationalityValue : undefined,
      metadata: parsedMetadata,
    });

    if (!created) {
      setError("Select a format before adding participants.");
      return;
    }

    setName("");
    setSeed("");
    setTeam("");
    setNationality("");
    setMetadata("");
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
        <div class="flex items-center gap-2">
          <span class="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
            Requirement 3.1
          </span>
          <span class="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
            Optional fields (Req 3.5)
          </span>
        </div>
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

      <div class="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-semibold text-neutral-800">Optional details</p>
          <span class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Requirement 3.5
          </span>
        </div>
        <p class="mt-1 text-xs text-neutral-600">
          Add seeds, team info, nationality, or structured metadata when you have them.
        </p>
        <div class="mt-3 grid gap-3 sm:grid-cols-2">
          <label class="space-y-1 text-sm text-neutral-800">
            <span class="font-semibold text-neutral-700">Seed (optional)</span>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              class="input w-full"
              placeholder="1"
              value={seed()}
              onInput={(event) => setSeed(event.currentTarget.value)}
              aria-label="Seed"
            />
          </label>
          <label class="space-y-1 text-sm text-neutral-800">
            <span class="font-semibold text-neutral-700">Team (optional)</span>
            <input
              type="text"
              class="input w-full"
              placeholder="e.g., Red Falcons"
              value={team()}
              onInput={(event) => setTeam(event.currentTarget.value)}
              aria-label="Team"
            />
          </label>
          <label class="space-y-1 text-sm text-neutral-800">
            <span class="font-semibold text-neutral-700">Nationality (optional)</span>
            <input
              type="text"
              class="input w-full"
              placeholder="e.g., Canada"
              value={nationality()}
              onInput={(event) => setNationality(event.currentTarget.value)}
              aria-label="Nationality"
            />
          </label>
          <label class="space-y-1 text-sm text-neutral-800 sm:col-span-2">
            <span class="font-semibold text-neutral-700">Metadata (JSON, optional)</span>
            <textarea
              class="input w-full min-h-[88px]"
              placeholder='{"role":"captain","notes":"prefers mornings"}'
              value={metadata()}
              onInput={(event) => setMetadata(event.currentTarget.value)}
              aria-label="Metadata JSON"
            />
            <span class="text-xs text-neutral-600">
              Provide a JSON object for format-specific attributes. Leave blank if none.
            </span>
          </label>
        </div>
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
