import { expect } from "@playwright/test";

export async function expectVisible(locator, options = {}) {
  await expect(locator).toBeVisible({ timeout: options.timeout ?? 10_000 });
  return locator;
}

export async function isVisible(locator, timeout = 1_000) {
  try {
    await expect(locator).toBeVisible({ timeout });
    return true;
  } catch {
    return false;
  }
}

export async function isEnabled(locator, timeout = 1_000) {
  try {
    await expect(locator).toBeEnabled({ timeout });
    return true;
  } catch {
    return false;
  }
}

export async function openDarkPlaces(page) {
  await page.goto("/darkplaces");
  await page.evaluate(() => {
    try {
      window.localStorage.clear();
      window.sessionStorage.clear();
    } catch {
      // Storage can be unavailable in unusual browser contexts. The UI flow still works without clearing it.
    }
  });
  await page.goto("/darkplaces");

  const composer = page.getByTestId("dark-places-composer");
  if (await isVisible(composer, 3_000)) return composer;

  // Fallback: keep the real navigation path covered if the URL harness is removed later.
  const crucibleButton = page
    .getByRole("button", { name: /crucible/i })
    .first();
  await expectVisible(crucibleButton);
  await crucibleButton.click();

  const darkPlacesButton = page
    .getByRole("button", { name: /dark places|locations/i })
    .or(page.getByText("Dark Places"))
    .first();
  await expectVisible(darkPlacesButton);
  await darkPlacesButton.click();

  await expectVisible(composer, { timeout: 15_000 });
  return composer;
}

export async function generateDarkPlace(page) {
  const generate = page.getByTestId("dark-places-generate");
  await expectVisible(generate);
  await expect(generate).toBeEnabled();
  await generate.click();

  await expectVisible(page.getByTestId("dark-places-map-stage"));
  await expectVisible(page.getByTestId("dark-places-room-node").first(), {
    timeout: 20_000,
  });
}

export async function openRoomsMode(page) {
  const roomsButton = page
    .getByTestId("dark-places-toolbar-rooms-action")
    .first();
  await expectVisible(roomsButton);
  await expect(roomsButton).toBeEnabled();
  await roomsButton.click();

  await expectVisible(page.getByTestId("dark-places-toolbar-rooms"));
  await expectVisible(page.getByTestId("dark-places-room-inspector"));
}

export async function enterRoomsModeFromMapNode(page) {
  const firstRoom = page.getByTestId("dark-places-room-node").first();
  await expectVisible(firstRoom);
  await firstRoom.click();
  await expectVisible(page.getByTestId("dark-places-toolbar-rooms"), {
    timeout: 10_000,
  });
  await expectVisible(page.getByTestId("dark-places-room-inspector"));
  await expect(firstRoom).toHaveAttribute("aria-pressed", "true", {
    timeout: 10_000,
  });
  return firstRoom;
}

export async function selectFirstRoom(page) {
  const firstRoom = page.getByTestId("dark-places-room-node").first();
  await expectVisible(firstRoom);
  await firstRoom.click();
  await expect(firstRoom).toHaveAttribute("aria-pressed", "true", {
    timeout: 10_000,
  });
  return firstRoom;
}

export async function addNextMissingRoomComponent(page, options = {}) {
  const addMissingSlot = page.getByTestId("dark-places-add-missing-slot");
  await expectVisible(addMissingSlot);
  await expect(addMissingSlot).toBeEnabled();
  await addMissingSlot.click();

  const picker = page.getByTestId("dark-places-component-picker");
  await expectVisible(picker, { timeout: 10_000 });
  await expect(picker).toHaveAttribute("data-slot-scope", "region");

  const firstAddButton = page.getByTestId("dark-places-component-add").first();
  const hasAddButton = await isVisible(
    firstAddButton,
    options.addTimeout ?? 2_000,
  );

  if (!hasAddButton) {
    await page
      .getByRole("button", { name: /close component navigator/i })
      .click();
    await expect(picker).toBeHidden({ timeout: 10_000 });
    return null;
  }

  await expect(firstAddButton).toBeEnabled();
  const actionLabel = await firstAddButton.getAttribute("aria-label");
  await firstAddButton.click();

  await expect(picker).toBeHidden({ timeout: 10_000 });
  return actionLabel || "component";
}

export async function fillSelectedRoomUntilReadyOrBlocked(
  page,
  maxIterations = 3,
) {
  const added = [];

  for (let index = 0; index < maxIterations; index += 1) {
    const addMissingSlot = page.getByTestId("dark-places-add-missing-slot");
    if (!(await isEnabled(addMissingSlot, 1_500))) break;

    const addedComponent = await addNextMissingRoomComponent(page);
    if (!addedComponent) break;
    added.push(addedComponent);
  }

  return added;
}

export async function openExportMode(page) {
  const exportButton = page
    .getByTestId("dark-places-toolbar-export-action")
    .first();
  await expectVisible(exportButton);
  await expect(exportButton).toBeEnabled();
  await exportButton.click();

  await expectVisible(page.getByTestId("dark-places-toolbar-export"));
  await expectVisible(page.getByTestId("dark-places-room-key"));
}
