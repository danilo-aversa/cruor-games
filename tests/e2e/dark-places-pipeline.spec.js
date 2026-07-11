import { expect, test } from "@playwright/test";
import {
  addNextMissingRoomComponent,
  enterRoomsModeFromMapNode,
  fillSelectedRoomUntilReadyOrBlocked,
  generateDarkPlace,
  isEnabled,
  openDarkPlaces,
  openExportMode,
  openRoomsMode,
  selectFirstRoom,
} from "./dark-places.helpers.js";

test.describe("Dark Places user pipeline", () => {
  test.setTimeout(90_000);

  test("runs the main Frame → Rooms → Slot Picker → Export journey", async ({ context, page }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://127.0.0.1:4173",
    });

    await openDarkPlaces(page);
    await generateDarkPlace(page);

    const firstRoom = await enterRoomsModeFromMapNode(page);
    const initialStatus = await firstRoom.getAttribute("data-room-status");
    expect(initialStatus).toMatch(/empty|partial|ready/);

    const addedComponents = await fillSelectedRoomUntilReadyOrBlocked(page, 3);
    expect(addedComponents.length).toBeGreaterThan(0);

    await expect(firstRoom).toHaveAttribute("data-room-status", /partial|ready/, { timeout: 10_000 });
    await expect(page.getByTestId("dark-places-room-inspector")).toContainText(/Room Readiness/i);

    await openExportMode(page);

    const roomKey = page.getByTestId("dark-places-room-key");
    await expect(roomKey).toContainText(/Export Room Key/i);
    await expect(roomKey).toContainText(/Room 0?1|Room Key|Environmental Hazard|Disturbing Clue|Encounter Twist/i);
    await expect(page.getByTestId("dark-places-room-key-card").first()).toBeVisible();

    await page.getByTestId("dark-places-copy-markdown").click();
    await expect(page.getByTestId("dark-places-copy-status")).toContainText(/copied|fallback|unavailable/i);
  });

  test("Review Missing returns from Export to the first incomplete room", async ({ page }) => {
    await openDarkPlaces(page);
    await generateDarkPlace(page);
    await openRoomsMode(page);
    await openExportMode(page);

    const reviewMissing = page.getByTestId("dark-places-review-missing");
    await expect(reviewMissing).toBeVisible();

    test.skip(!(await isEnabled(reviewMissing, 1_500)), "Generated location has no incomplete rooms to review.");

    await reviewMissing.click();
    await expect(page.getByTestId("dark-places-toolbar-rooms")).toBeVisible();
    await expect(page.getByTestId("dark-places-room-inspector")).toBeVisible();
    await expect(page.getByTestId("dark-places-add-missing-slot")).toBeEnabled();
  });

  test("map room indicators select rooms and reflect room work progress", async ({ page }) => {
    await openDarkPlaces(page);
    await generateDarkPlace(page);
    await openRoomsMode(page);

    const roomNodes = page.getByTestId("dark-places-room-node");
    await expect(roomNodes.first()).toBeVisible();
    await expect(roomNodes.first()).toHaveAttribute("data-room-status", /empty|partial|ready/);

    const firstRoom = await selectFirstRoom(page);
    await addNextMissingRoomComponent(page);

    await expect(firstRoom).toHaveAttribute("data-room-status", /partial|ready/, { timeout: 10_000 });
    await expect(page.getByTestId("dark-places-room-slot").first()).toBeVisible();
    await expect(page.getByTestId("dark-places-room-navigator")).toBeVisible();
    await expect(page.getByTestId("dark-places-room-nav-item").first()).toBeVisible();
  });

  test("immersive mode keeps the toolbar and editor while hiding peripheral UI", async ({ page }) => {
    await openDarkPlaces(page);
    await generateDarkPlace(page);

    const immersiveToggle = page.getByTestId("dark-places-immersive-mode");
    await expect(immersiveToggle).toBeVisible();
    await expect(immersiveToggle).toHaveAttribute("aria-pressed", "false");

    await immersiveToggle.click();

    await expect(immersiveToggle).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".site-topbar")).toBeHidden();
    await expect(page.getByTestId("dark-places-map-stage")).toBeVisible();
    await expect(page.locator(".location-composer__rail")).toHaveCount(0);
    await expect(page.locator(".location-stage-progress-dock")).toHaveCount(0);

    await immersiveToggle.click();

    await expect(immersiveToggle).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator(".site-topbar")).toBeVisible();
    await expect(page.locator(".location-composer__rail").first()).toBeVisible();
  });
});
