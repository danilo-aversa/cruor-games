import { describe, expect, it } from "vitest";

import {
  TRIGGER_WARNING_LABELS,
  getTriggerWarningDefinition,
  getTriggerWarningDefinitions,
  normalizeTriggerWarnings,
} from "./trigger-warnings.js";

describe("shared Trigger Warning library", () => {
  it("uses broad content-warning categories with capitalized labels", () => {
    expect(normalizeTriggerWarnings(["bones", "animal death", "bones"]))
      .toEqual(["Bones", "Animal Death"]);
    expect(TRIGGER_WARNING_LABELS).toContain("Death");
    expect(TRIGGER_WARNING_LABELS).toContain("Religion");
    expect(TRIGGER_WARNING_LABELS).not.toContain("Human Remains And Bodily Exposure");
    expect(TRIGGER_WARNING_LABELS.every((label) => /^[A-Z]/.test(label))).toBe(true);
  });

  it("migrates obsolete micro-descriptors into general warnings", () => {
    expect(normalizeTriggerWarnings([
      "Death And Funerary Practice",
      "Human Remains And Bodily Exposure",
      "Carrion Birds Feeding On The Dead",
      "Religious Ritual And Ritual Pollution",
      "Ecological Collapse",
    ])).toEqual(["Death", "Religion", "Bones", "Gore", "Animal Death"]);
  });

  it("provides a detailed tooltip description for every library entry", () => {
    const entries = getTriggerWarningDefinitions(TRIGGER_WARNING_LABELS);
    expect(entries).toHaveLength(TRIGGER_WARNING_LABELS.length);
    expect(entries.every((entry) => entry.description.length > 24)).toBe(true);
    expect(entries.every((entry) => /^fa-/.test(entry.icon))).toBe(true);
    expect(new Set(entries.map((entry) => entry.icon)).size).toBe(entries.length);
    expect(getTriggerWarningDefinition("vomiting")).toMatchObject({ label: "Emesis" });
  });
});
