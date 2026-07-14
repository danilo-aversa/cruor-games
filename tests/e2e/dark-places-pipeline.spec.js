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

  test("runs the main Frame → Rooms → Slot Picker → Export journey", async ({ browserName, context, page }) => {
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"], {
        origin: "http://127.0.0.1:4173",
      });
    }

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
    await expect(page.getByTestId("dark-places-export-tab-sessionInsert")).toBeVisible();
    await expect(page.getByTestId("dark-places-export-tab-tableText")).toBeVisible();
    await expect(page.getByTestId("dark-places-export-tab-markdown")).toBeVisible();
    await expect(page.getByTestId("dark-places-export-tab-json")).toBeVisible();
    await expect(page.getByTestId("dark-places-export-tab-svg")).toBeVisible();

    await page.getByTestId("dark-places-export-tab-json").click();
    await expect(page.getByTestId("dark-places-export-preview-json")).toContainText(/dark-places-export-v1/i);

    await page.getByTestId("dark-places-export-tab-svg").click();
    await expect(page.getByTestId("dark-places-export-preview-svg")).toContainText(/Current map SVG ready/i);
    await expect(page.getByTestId("dark-places-export-copy-active")).toBeEnabled();
    await expect(page.getByTestId("dark-places-export-download-active")).toBeEnabled();

    await page.getByTestId("dark-places-export-tab-roomKey").click();
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

  test("Special Shapes stays open while entering the repositioned nested flyout", async ({ page }) => {
    await openDarkPlaces(page);
    await generateDarkPlace(page);
    await openRoomsMode(page);

    const roomHotspot = page.locator(".room-preview-hotspot").first();
    await expect(roomHotspot).toBeVisible();
    await roomHotspot.click({ button: "right" });

    const roomMenu = page.locator(".room-style-context-menu");
    await expect(roomMenu).toBeVisible();

    const shapeSection = roomMenu.locator('[data-room-menu-group="shape"]');
    await shapeSection.hover();

    const shapeFlyout = shapeSection.locator(':scope > [data-room-menu-flyout="shape"]');
    await expect(shapeFlyout).toBeVisible();
    const shapeFlyoutBefore = await shapeFlyout.boundingBox();

    const specialSection = shapeFlyout.locator('[data-room-shape-group="special"]');
    await specialSection.hover();

    const specialFlyout = specialSection.locator(
      ':scope > [data-room-shape-flyout="special"]'
    );
    await expect(specialFlyout).toBeVisible();
    await page.waitForTimeout(240);
    await expect(specialFlyout).toBeVisible();

    const shapeFlyoutAfter = await shapeFlyout.boundingBox();
    expect(Math.abs((shapeFlyoutAfter?.y || 0) - (shapeFlyoutBefore?.y || 0))).toBeLessThanOrEqual(
      1
    );

    await specialFlyout.getByRole("menuitem", { name: /Hall/i }).hover();
    await expect(specialFlyout).toBeVisible();
  });
  test("room corner handle commits one Custom resize from the map", async ({ page }) => {
    await openDarkPlaces(page);
    await generateDarkPlace(page);
    await openRoomsMode(page);

    const roomSurface = page.locator(".room-drag-handle").first();
    await expect(roomSurface).toBeAttached();
    await roomSurface.hover({ force: true });

    const resizeHandle = page.locator("[data-room-resize-handle]").first();
    await expect(resizeHandle).toBeVisible();
    const hitBridge = resizeHandle.locator(
      '[data-room-resize-hit-bridge="true"]',
    );
    await expect(hitBridge).toBeVisible();
    await expect(
      resizeHandle.locator(".room-resize-handle__glyph"),
    ).toHaveCount(1);
    await expect(
      resizeHandle.locator(".room-resize-handle__corner"),
    ).toHaveCount(0);
    const beforeWidth = Number(await resizeHandle.getAttribute("data-room-resize-width"));
    const beforeHeight = Number(await resizeHandle.getAttribute("data-room-resize-height"));
    const bridgeBox = await hitBridge.boundingBox();
    expect(bridgeBox).not.toBeNull();

    const startX =
      (bridgeBox?.x || 0) + Math.max(2, (bridgeBox?.width || 0) - 4);
    const startY = (bridgeBox?.y || 0) + 4;
    await page.mouse.move(startX, startY);
    await page.waitForTimeout(120);
    await expect(resizeHandle).toBeVisible();
    await page.mouse.down();
    await page.mouse.move(startX + 64, startY, { steps: 6 });

    const preview = page.locator("[data-room-resize-preview]");
    await expect(preview).toBeVisible();
    await expect(preview).toHaveAttribute("data-room-resize-size", /\d+×\d+/);

    await page.mouse.up();
    await expect(preview).toHaveCount(0);

    await roomSurface.hover({ force: true });
    const committedHandle = page.locator("[data-room-resize-handle]").first();
    await expect(committedHandle).toBeVisible();
    const afterWidth = Number(await committedHandle.getAttribute("data-room-resize-width"));
    const afterHeight = Number(await committedHandle.getAttribute("data-room-resize-height"));
    expect(afterWidth !== beforeWidth || afterHeight !== beforeHeight).toBeTruthy();

    await page.getByRole("button", { name: "Undo" }).first().click();
    await roomSurface.hover({ force: true });
    const restoredHandle = page.locator("[data-room-resize-handle]").first();
    await expect(restoredHandle).toHaveAttribute("data-room-resize-width", String(beforeWidth));
    await expect(restoredHandle).toHaveAttribute("data-room-resize-height", String(beforeHeight));
  });

  test("Map Actions and More Map Tools use the shared dropdown family", async ({ page }) => {
    await openDarkPlaces(page);
    await generateDarkPlace(page);
    await openRoomsMode(page);

    const viewport = page.locator(".map-viewport").first();
    const viewportBox = await viewport.boundingBox();
    expect(viewportBox).not.toBeNull();
    await viewport.evaluate((node, point) => {
      node.dispatchEvent(
        new MouseEvent("contextmenu", {
          bubbles: true,
          cancelable: true,
          clientX: point.x,
          clientY: point.y,
          button: 2,
        })
      );
    }, {
      x: (viewportBox?.x || 0) + 12,
      y: (viewportBox?.y || 0) + 12,
    });

    const mapActions = page.getByRole("menu", { name: "Map actions" });
    await expect(mapActions).toBeVisible();
    await expect(mapActions).toHaveClass(/cruor-dropdown-menu--context/);
    const gridSection = mapActions.locator('[data-room-menu-group="map-action-grid"]');
    await gridSection.hover();
    const gridFlyout = gridSection.locator(':scope > [data-room-menu-flyout="map-action-grid"]');
    await expect(gridFlyout).toBeVisible();
    await expect(gridFlyout).toHaveClass(/cruor-dropdown-menu--submenu/);

    await page.keyboard.press("Escape");
    const moreTools = page.getByRole("button", { name: "More map tools" });
    await moreTools.click();
    const moreToolsMenu = page.getByRole("menu", { name: "Secondary map tools" });
    await expect(moreToolsMenu).toBeVisible();
    await expect(moreToolsMenu).toHaveClass(/cruor-dropdown-menu--context/);
    await expect(moreToolsMenu.locator(".cruor-dropdown-option")).toHaveCount(3);
  });

});
