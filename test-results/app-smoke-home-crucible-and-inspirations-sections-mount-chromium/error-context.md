# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app-smoke.spec.js >> home, crucible, and inspirations sections mount
- Location: tests\e2e\app-smoke.spec.js:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /build drop-in horror for the session you already prepared/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /build drop-in horror for the session you already prepared/i })

```

```yaml
- banner:
  - button "Go to Cruor Games home":
    - strong: Cruor Games
  - navigation "Primary sections":
    - button "Home"
    - button "Crucible"
    - button "Inspirations"
  - button "Open interface options": Simple
  - button "Login placeholder" [disabled]: Login
- main:
  - region "Home":
    - region "Build Horror for Your 5E Sessions":
      - region "Cruor Games homepage hero":
        - heading "Build Horror for Your 5E Sessions" [level=1]
        - paragraph: Cruor turns real sources of dread into playable horror content — haunted places, disturbing monsters, and dark fantasy flavour you can actually use at the table.
        - button "Open the Workbench"
        - button "Browse Inspirations"
        - complementary "Cruor workbench preview":
          - img "Cruor workbench interface preview with dark fantasy tools and source-inspired horror material."
          - img "Dark fantasy dungeon map crop from the Cruor location workbench."
          - img "Cruor inspiration card crop showing real sources transformed into playable horror."
      - region "Project statement":
        - heading "Built for the Session You Already Have." [level=2]
        - paragraph: Cruor does not ask you to start over. It helps you turn an existing location, threat, or inspiration into horror material you can actually use at the table.
      - region "Featured Creation Tools":
        - heading "Featured Creation Tools" [level=2]
        - paragraph: The current tools are only the first surfaces of the workbench — not the whole idea.
        - article:
          - text: Image Placeholder
          - strong: Dungeon Generator Visual
          - paragraph: Use a strong map preview or UI crop from Darken a Location.
          - heading "Darken a Dungeon" [level=3]
          - paragraph: Build a haunted location around the session you already have.
          - button "Explore the Dungeon Generator"
        - article:
          - text: Image Placeholder
          - strong: Monster Generator Visual
          - paragraph: Use a monster silhouette, Crucible slot view, or composer crop.
          - heading "Forge a Monster" [level=3]
          - paragraph: Create a disturbing creature with pressure, weakness, and table-ready flavour.
          - button "Explore the Monster Generator"
      - region "Real Sources, Playable Horror.":
        - heading "Real Sources, Playable Horror." [level=2]
        - paragraph: Cruor draws from things that really exist — folklore, history, ritual practice, architecture, biology, and material culture — then transforms them into playable content and dark fantasy flavour for your sessions.
        - button "Browse Our Inspirations"
        - article:
          - text: Inspiration Historical Object
          - heading "Wax Death Masks" [level=3]
          - paragraph: Preserved faces, false presence, devotional grief.
        - article:
          - text: Inspiration Biological Process
          - heading "Decomposition" [level=3]
          - paragraph: Gas, sweetness, pressure, impossible decay.
        - article:
          - text: Image Placeholder Hover Stack
          - heading "Sedlec Ossuary" [level=3]
          - paragraph: Replace this stack with 3–4 overlapping inspiration cards. On hover, the top card can shift or swap to reveal another source.
      - region "Support the Workbench":
        - heading "Support the Workbench" [level=2]
        - paragraph: Patreon helps Cruor grow through new content, sharper tools, and a deeper library of dark fantasy material for 5E.
        - link "Join the Patreon":
          - /url: "#support"
        - text: Image Placeholder
        - strong: Support Visual
        - paragraph: Use a soft collage of map crop, monster crop, and inspiration cards.
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | test("home, crucible, and inspirations sections mount", async ({ page }) => {
  4  |   await page.goto("/");
  5  | 
  6  |   await expect(page.getByRole("banner").getByText("Cruor Games")).toBeVisible();
  7  | 
  8  |   await expect(
  9  |     page.getByRole("heading", {
  10 |       name: /build drop-in horror for the session you already prepared/i,
  11 |     })
> 12 |   ).toBeVisible();
     |     ^ Error: expect(locator).toBeVisible() failed
  13 | 
  14 |   await page.getByRole("button", { name: "Crucible" }).click();
  15 |   await expect(page.getByRole("heading", { name: /i need to/i })).toBeVisible();
  16 | 
  17 |   await page.getByRole("button", { name: "Inspirations" }).click();
  18 |   await expect(page.getByRole("main")).toContainText(/Inspirations|Source|Anchor/i);
  19 | 
  20 |   await page.getByRole("button", { name: "Home" }).click();
  21 | 
  22 |   await expect(
  23 |     page.getByRole("heading", {
  24 |       name: /build drop-in horror for the session you already prepared/i,
  25 |     })
  26 |   ).toBeVisible();
  27 | });
  28 | 
  29 | test("Darken a Location composer and map view mount", async ({ page }) => {
  30 |   await page.goto("/");
  31 | 
  32 |   await page.getByRole("button", { name: "Location" }).click();
  33 | 
  34 |   await expect(page.locator("[data-location-composer-ready='true']")).toBeVisible();
  35 |   await expect(page.getByRole("heading", { name: /haunted map board prototype/i })).toBeVisible();
  36 | 
  37 |   await page.getByRole("tab", { name: "Map" }).click();
  38 | 
  39 |   await expect(page.locator("#darkenMapGeneratorPanel")).toBeVisible();
  40 |   await expect(page.locator("#darkenMapGeneratorPanel svg").first()).toBeVisible();
  41 | });
  42 | 
  43 | test("Build a Monster can start from scratch and open the graft navigator", async ({ page }) => {
  44 |   await page.goto("/");
  45 | 
  46 |   await page.getByRole("button", { name: "Monster" }).click();
  47 |   await expect(page.locator(".monster-shell")).toBeVisible();
  48 | 
  49 |   await page.getByRole("button", { name: /build from scratch/i }).click();
  50 |   await expect(page.locator(".monster-shell")).toHaveAttribute("data-composer-started", "true");
  51 | 
  52 |   await page
  53 |     .getByRole("button", { name: /focus body/i })
  54 |     .first()
  55 |     .click();
  56 | 
  57 |   const graftDialog = page.getByRole("dialog", { name: /choose body graft/i });
  58 |   await expect(graftDialog).toBeVisible();
  59 | 
  60 |   const firstAddButton = graftDialog.getByRole("button", { name: /^Add / }).first();
  61 |   await expect(firstAddButton).toBeVisible();
  62 |   await expect(firstAddButton).toBeEnabled();
  63 | 
  64 |   await firstAddButton.focus();
  65 |   await page.keyboard.press("Enter");
  66 | 
  67 |   await expect(graftDialog).toBeHidden();
  68 |   await expect(page.getByLabel("Selected graft inspector")).toContainText(/Installed/i);
  69 | });
  70 | 
```