import { describe, expect, it } from "bun:test";
import {
  getStepNavigationSnapshot,
  goToNextStep,
  goToPreviousStep,
} from "./navigation";
import { setCurrentStep, setTournamentState, tournamentState } from "./store";

const resetState = () => {
  setTournamentState({
    currentConfig: null,
    currentStructure: null,
    step: "format-selection",
    isDirty: false,
  });
};

describe("step navigation helpers", () => {
  it("returns snapshot details for the current step with back disabled on the first step", () => {
    resetState();
    const snapshot = getStepNavigationSnapshot(tournamentState.step);

    expect(snapshot.current).toBe("format-selection");
    expect(snapshot.currentTitle).toBe("Choose a format");
    expect(snapshot.currentIndex).toBe(0);
    expect(snapshot.totalSteps > 0).toBe(true);
    expect(snapshot.previous).toBe(null);
    expect(snapshot.previousTitle).toBe(null);
    expect(snapshot.next).toBe("configuration");
    expect(snapshot.nextTitle).toBe("Configure rules");
  });

  it("advances to the next step and updates global state", () => {
    resetState();
    const advanced = goToNextStep();

    expect(advanced).toBe("configuration");
    expect(tournamentState.step).toBe("configuration");
  });

  it("moves backward from a middle step and ignores back on the first step", () => {
    resetState();
    setCurrentStep("participants");

    const movedBack = goToPreviousStep();
    expect(movedBack).toBe("configuration");
    expect(tournamentState.step).toBe("configuration");

    const movedToFirst = goToPreviousStep();
    expect(movedToFirst).toBe("format-selection");
    expect(tournamentState.step).toBe("format-selection");

    const blocked = goToPreviousStep();
    expect(blocked).toBe(null);
    expect(tournamentState.step).toBe("format-selection");
  });

  it("prevents advancing beyond the final step", () => {
    resetState();
    setCurrentStep("review");

    const blocked = goToNextStep();
    expect(blocked).toBe(null);
    expect(tournamentState.step).toBe("review");
  });
});
