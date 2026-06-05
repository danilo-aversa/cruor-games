# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app-smoke.spec.js >> Darken a Location composer and map view mount
- Location: tests\e2e\app-smoke.spec.js:29:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Location' })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - button "Go to Cruor Games home" [ref=e6] [cursor=pointer]:
        - strong [ref=e9]: Cruor Games
      - generic [ref=e10]:
        - navigation "Primary sections" [ref=e11]:
          - button "Home" [ref=e12] [cursor=pointer]:
            - generic [ref=e13]: 
            - generic [ref=e14]: Home
          - button "Crucible" [ref=e16] [cursor=pointer]:
            - generic [ref=e17]: 
            - generic [ref=e18]: Crucible
            - generic [ref=e19]: 
          - button "Inspirations" [ref=e20] [cursor=pointer]:
            - generic [ref=e21]: 
            - generic [ref=e22]: Inspirations
        - generic [ref=e23]:
          - button "Open interface options" [ref=e24] [cursor=pointer]:
            - generic [ref=e25]: 
            - generic [ref=e26]: Simple
          - button "Login placeholder" [disabled] [ref=e27]:
            - generic [ref=e28]: 
            - generic [ref=e29]: Login
          - text: 
  - main [ref=e30]:
    - region "Home" [ref=e31]:
      - region "Build Horror for Your 5E Sessions" [ref=e32]:
        - region "Cruor Games homepage hero" [ref=e33]:
          - generic [ref=e34]:
            - heading "Build Horror for Your 5E Sessions" [level=1] [ref=e35]:
              - text: Build Horror
              - text: for Your 5E Sessions
            - paragraph [ref=e36]: Cruor turns real sources of dread into playable horror content — haunted places, disturbing monsters, and dark fantasy flavour you can actually use at the table.
            - generic "Primary home actions" [ref=e37]:
              - button "Open the Workbench" [ref=e38] [cursor=pointer]
              - button "Browse Inspirations" [ref=e39] [cursor=pointer]:
                - text: Browse Inspirations
                - generic [ref=e40]: 
          - complementary "Cruor workbench preview" [ref=e41]:
            - generic [ref=e42]:
              - img "Cruor workbench interface preview with dark fantasy tools and source-inspired horror material." [ref=e44]
              - img "Dark fantasy dungeon map crop from the Cruor location workbench." [ref=e46]
              - img "Cruor inspiration card crop showing real sources transformed into playable horror." [ref=e48]
        - region "Project statement" [ref=e49]:
          - generic [ref=e50]:
            - heading "Built for the Session You Already Have." [level=2] [ref=e51]
            - paragraph [ref=e52]: Cruor does not ask you to start over. It helps you turn an existing location, threat, or inspiration into horror material you can actually use at the table.
        - region "Featured Creation Tools" [ref=e53]:
          - generic [ref=e54]:
            - heading "Featured Creation Tools" [level=2] [ref=e55]
            - paragraph [ref=e56]: The current tools are only the first surfaces of the workbench — not the whole idea.
          - generic [ref=e57]:
            - article [ref=e58]:
              - generic [ref=e60]:
                - generic [ref=e61]: Image Placeholder
                - strong [ref=e62]: Dungeon Generator Visual
                - paragraph [ref=e63]: Use a strong map preview or UI crop from Darken a Location.
              - generic [ref=e64]:
                - heading "Darken a Dungeon" [level=3] [ref=e65]
                - paragraph [ref=e66]: Build a haunted location around the session you already have.
              - button "Explore the Dungeon Generator" [ref=e67] [cursor=pointer]:
                - text: Explore the Dungeon Generator
                - generic [ref=e68]: 
            - article [ref=e69]:
              - generic [ref=e71]:
                - generic [ref=e72]: Image Placeholder
                - strong [ref=e73]: Monster Generator Visual
                - paragraph [ref=e74]: Use a monster silhouette, Crucible slot view, or composer crop.
              - generic [ref=e75]:
                - heading "Forge a Monster" [level=3] [ref=e76]
                - paragraph [ref=e77]: Create a disturbing creature with pressure, weakness, and table-ready flavour.
              - button "Explore the Monster Generator" [ref=e78] [cursor=pointer]:
                - text: Explore the Monster Generator
                - generic [ref=e79]: 
        - region "Real Sources, Playable Horror." [ref=e80]:
          - generic [ref=e81]:
            - generic [ref=e82]:
              - heading "Real Sources, Playable Horror." [level=2] [ref=e83]
              - paragraph [ref=e84]: Cruor draws from things that really exist — folklore, history, ritual practice, architecture, biology, and material culture — then transforms them into playable content and dark fantasy flavour for your sessions.
            - button "Browse Our Inspirations" [ref=e85] [cursor=pointer]
          - generic "Inspiration cards placeholder" [ref=e86]:
            - article [ref=e87]:
              - generic [ref=e88]:
                - generic [ref=e89]: Inspiration
                - generic [ref=e90]: Historical Object
              - heading "Wax Death Masks" [level=3] [ref=e91]
              - paragraph [ref=e92]: Preserved faces, false presence, devotional grief.
            - article [ref=e93]:
              - generic [ref=e94]:
                - generic [ref=e95]: Inspiration
                - generic [ref=e96]: Biological Process
              - heading "Decomposition" [level=3] [ref=e97]
              - paragraph [ref=e98]: Gas, sweetness, pressure, impossible decay.
            - article [ref=e99]:
              - generic [ref=e100]:
                - generic [ref=e101]: Image Placeholder
                - generic [ref=e102]: Hover Stack
              - heading "Sedlec Ossuary" [level=3] [ref=e103]
              - paragraph [ref=e104]: Replace this stack with 3–4 overlapping inspiration cards. On hover, the top card can shift or swap to reveal another source.
        - region "Support the Workbench" [ref=e105]:
          - generic [ref=e106]:
            - generic [ref=e107]:
              - heading "Support the Workbench" [level=2] [ref=e108]
              - paragraph [ref=e109]: Patreon helps Cruor grow through new content, sharper tools, and a deeper library of dark fantasy material for 5E.
              - link "Join the Patreon" [ref=e110] [cursor=pointer]:
                - /url: "#support"
            - generic [ref=e112]:
              - generic [ref=e113]: Image Placeholder
              - strong [ref=e114]: Support Visual
              - paragraph [ref=e115]: Use a soft collage of map crop, monster crop, and inspiration cards.
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
  12 |   ).toBeVisible();
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
> 32 |   await page.getByRole("button", { name: "Location" }).click();
     |                                                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
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