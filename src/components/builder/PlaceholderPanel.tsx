import type { Component } from "solid-js";

interface PlaceholderPanelProps {
  readonly title: string;
  readonly description: string;
}

const PlaceholderPanel: Component<PlaceholderPanelProps> = (props) => (
  <div class="space-y-3">
    <div class="space-y-1">
      <p class="text-xs font-semibold uppercase tracking-wide text-neutral-600">
        {props.title}
      </p>
      <p class="text-sm text-neutral-700">{props.description}</p>
    </div>
    <div class="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-600 shadow-[inset_0_1px_0_rgba(17,24,39,0.04)]">
      Interactive island hooks are ready here. Implementations arrive in the next tasks.
    </div>
  </div>
);

export default PlaceholderPanel;
