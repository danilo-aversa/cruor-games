# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app-smoke.spec.js >> Build a Monster can start from scratch and open the graft navigator
- Location: tests\e2e\app-smoke.spec.js:43:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /focus body/i }).first()

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
    - region "Crucible workspace" [ref=e31]:
      - region "Crucible workspace" [ref=e32]:
        - tabpanel "Build a Monster Composer" [ref=e33]:
          - main [ref=e35]:
            - region "The Crucible build canvas" [ref=e37]:
              - region "Monster anatomy composer" [ref=e38]:
                - generic [ref=e39]:
                  - generic [ref=e40]:
                    - complementary "Monster Frame controls" [ref=e41]:
                      - generic [ref=e42]:
                        - generic [ref=e44]: Chassis
                        - generic [ref=e45]:
                          - generic [ref=e46]:
                            - generic [ref=e47]:
                              - generic [ref=e48]: Family
                              - 'button "Family: Corpse, bone, spirit, rot, hunger. · 3 variants **Undead**. Corpse, bone, spirit, rot, hunger. · 3 variants **Beast**. Predator body, instinct, mobility. · 3 variants **Aberration**. Alien anatomy. Future pack. · 4 variants · Unavailable / future pack" [ref=e49]':
                                - generic [ref=e50]: "?"
                            - button "Undead 3 variants" [ref=e51] [cursor=pointer]:
                              - img [ref=e52]
                              - strong [ref=e57]: Undead
                              - generic [ref=e58]: 3 variants
                          - generic [ref=e59]:
                            - generic [ref=e60]:
                              - generic [ref=e61]: Variant
                              - 'button "Variant: Creature body variant. **Zombie**. Creature body variant. **Skeleton**. Creature body variant. **Spirit**. Creature body variant." [ref=e62]':
                                - generic [ref=e63]: "?"
                            - button "Zombie" [ref=e64] [cursor=pointer]:
                              - img [ref=e65]
                              - strong [ref=e67]: Zombie
                      - generic [ref=e68]:
                        - generic [ref=e70]: Combat Identity
                        - generic [ref=e71]:
                          - generic [ref=e72]:
                            - generic [ref=e73]:
                              - generic [ref=e74]: Encounter Footprint
                              - strong [ref=e75]: Standard
                              - 'button "Encounter Footprint: A full creature for one encounter slot. · HP 100 · DPR 100 **Minion**. Low HP, simple damage, useful in groups. · HP 45 · DPR 75 **Standard**. A full creature for one encounter slot. · HP 100 · DPR 100 **Boss**. A setpiece monster with reactions, phases, or lair pressure. · HP 230 · DPR 125" [ref=e76]':
                                - generic [ref=e77]: "?"
                            - radiogroup "Encounter Footprint" [ref=e78]:
                              - radio "Minion" [ref=e79] [cursor=pointer]:
                                - img [ref=e80]
                                - generic [ref=e85]: Minion
                              - radio "Standard" [checked] [ref=e86] [cursor=pointer]:
                                - img [ref=e87]
                                - generic [ref=e89]: Standard
                              - radio "Boss" [ref=e90] [cursor=pointer]:
                                - img [ref=e91]
                                - generic [ref=e93]: Boss
                          - generic [ref=e94]:
                            - generic [ref=e95]:
                              - generic [ref=e96]: Role
                              - strong [ref=e97]: Brute
                              - 'button "Role: High durability and direct damage. Low tactical trickery. **Brute**. High durability and direct damage. Low tactical trickery. **Skirmisher**. Mobile threat that pressures weak positions and retreats. **Controller**. Shapes space with saves, movement denial, terrain, and conditions. **Lurker**. Ambush predator with stealth, burst, and readable counterplay. **Artillery**. Ranged or area pressure that must be protected by space or minions. **Support**. Makes other threats worse through buffs, healing, summons, or scene pressure." [ref=e98]':
                                - generic [ref=e99]: "?"
                            - radiogroup "Role" [ref=e100]:
                              - radio "Brute" [checked] [ref=e101] [cursor=pointer]:
                                - img [ref=e102]
                                - generic [ref=e107]: Brute
                              - radio "Skirmisher" [ref=e108] [cursor=pointer]:
                                - img [ref=e109]
                                - generic [ref=e111]: Skirmisher
                              - radio "Controller" [ref=e112] [cursor=pointer]:
                                - img [ref=e113]
                                - generic [ref=e114]: Controller
                              - radio "Lurker" [ref=e115] [cursor=pointer]:
                                - img [ref=e116]
                                - generic [ref=e119]: Lurker
                              - radio "Artillery" [ref=e120] [cursor=pointer]:
                                - img [ref=e121]
                                - generic [ref=e123]: Artillery
                              - radio "Support" [ref=e124] [cursor=pointer]:
                                - img [ref=e125]
                                - generic [ref=e128]: Support
                      - generic [ref=e129]:
                        - generic [ref=e131]: Threat Profile
                        - generic [ref=e132]:
                          - generic "Target CR" [ref=e133]:
                            - generic [ref=e134]:
                              - generic [ref=e135]: Target CR
                              - 'button "Target CR: Sets the monster''s expected challenge rating. You can drag the slider or type the exact number. • **0–30**. Type a precise CR or drag the slider." [ref=e136]':
                                - generic [ref=e137]: "?"
                            - generic [ref=e138]:
                              - slider "Target CR slider" [ref=e139]: "5"
                              - spinbutton "Target CR number" [ref=e140]: "5"
                          - generic [ref=e141]:
                            - generic [ref=e142]:
                              - generic [ref=e143]: Tier
                              - strong [ref=e144]: Normal
                              - 'button "Tier: Baseline monster for its CR. **Normal**. Baseline monster for its CR. **Elite**. Stronger single threat without full legendary action economy. **Boss**. Setpiece creature with phases, reactions, or lair pressure. **Legendary**. Solo-grade monster with alternative action economy. **Setpiece**. Encounter-defining horror object, ritual beast, or scene monster." [ref=e145]':
                                - generic [ref=e146]: "?"
                            - radiogroup "Tier" [ref=e147]:
                              - radio "Normal" [checked] [ref=e148] [cursor=pointer]:
                                - img [ref=e149]
                                - generic [ref=e151]: Normal
                              - radio "Elite" [ref=e152] [cursor=pointer]:
                                - img [ref=e153]
                                - generic [ref=e158]: Elite
                              - radio "Boss" [ref=e159] [cursor=pointer]:
                                - img [ref=e160]
                                - generic [ref=e162]: Boss
                              - radio "Legendary" [ref=e163] [cursor=pointer]:
                                - img [ref=e164]
                                - generic [ref=e166]: Legendary
                              - radio "Setpiece" [ref=e167] [cursor=pointer]:
                                - img [ref=e168]
                                - generic [ref=e170]: Setpiece
                          - generic [ref=e171]:
                            - generic [ref=e172]:
                              - generic [ref=e173]: Tempo
                              - strong [ref=e174]: Standard
                              - 'button "Tempo: Uses ordinary initiative and turn rhythm. **Slow**. Predictable, heavy, and easier to kite. **Standard**. Uses ordinary initiative and turn rhythm. **Fast**. Acts early and can punish exposed characters. **Ambusher**. Front-loaded pressure before the party fully stabilizes. **Legendary**. Boss tempo through initiative, reactions, lair pressure, or off-turn actions." [ref=e175]':
                                - generic [ref=e176]: "?"
                            - radiogroup "Tempo" [ref=e177]:
                              - radio "Slow" [ref=e178] [cursor=pointer]:
                                - img [ref=e179]
                                - generic [ref=e182]: Slow
                              - radio "Standard" [checked] [ref=e183] [cursor=pointer]:
                                - img [ref=e184]
                                - generic [ref=e186]: Standard
                              - radio "Fast" [ref=e187] [cursor=pointer]:
                                - img [ref=e188]
                                - generic [ref=e190]: Fast
                              - radio "Ambusher" [ref=e191] [cursor=pointer]:
                                - img [ref=e192]
                                - generic [ref=e195]: Ambusher
                              - radio "Legendary" [ref=e196] [cursor=pointer]:
                                - img [ref=e197]
                                - generic [ref=e199]: Legendary
                          - generic [ref=e200]:
                            - generic [ref=e201]:
                              - generic [ref=e202]: Danger
                              - strong [ref=e203]: Hard
                              - 'button "Danger: How punishing the final build should feel. **Standard**. How punishing the final build should feel. **Hard**. How punishing the final build should feel. **Horror Setpiece**. How punishing the final build should feel." [ref=e204]':
                                - generic [ref=e205]: "?"
                            - radiogroup "Danger" [ref=e206]:
                              - radio "Standard" [ref=e207] [cursor=pointer]:
                                - img [ref=e208]
                                - generic [ref=e210]: Standard
                              - radio "Hard" [checked] [ref=e211] [cursor=pointer]:
                                - img [ref=e212]
                                - generic [ref=e214]: Hard
                              - radio "Horror Setpiece" [ref=e215] [cursor=pointer]:
                                - img [ref=e216]
                                - generic [ref=e218]: Horror Setpiece
                    - generic "Interactive monster silhouette" [ref=e219]:
                      - generic [ref=e220]:
                        - img
                        - button "Zombie Silhouette. Frame setup active." [ref=e221]
                        - generic [ref=e224]:
                          - img [ref=e225]
                          - generic [ref=e227]: Family
                          - strong [ref=e228]: Undead
                        - generic [ref=e229]:
                          - img [ref=e230]
                          - generic [ref=e232]: Variant
                          - strong [ref=e233]: Zombie
                        - generic [ref=e234]:
                          - img [ref=e235]
                          - generic [ref=e240]: Footprint
                          - strong [ref=e241]: Standard
                        - generic [ref=e242]:
                          - img [ref=e243]
                          - generic [ref=e245]: Job
                          - strong [ref=e246]: Brute
                        - generic [ref=e247]:
                          - img [ref=e248]
                          - generic [ref=e251]: CR
                          - strong [ref=e252]: CR 5
                        - generic [ref=e253]:
                          - img [ref=e254]
                          - generic [ref=e256]: Threat
                          - strong [ref=e257]: Hard
                    - complementary "Current Monster Frame" [ref=e258]:
                      - generic [ref=e259]:
                        - generic [ref=e260]: Current Frame
                        - generic [ref=e261]:
                          - generic [ref=e262]: Monster name
                          - textbox "Monster name" [ref=e263]: Cruor Zombie
                        - emphasis [ref=e264]: Undead · Zombie · Standard
                      - generic [ref=e266]:
                        - generic [ref=e267]:
                          - generic [ref=e268]: Family
                          - strong [ref=e269]: Undead
                        - generic [ref=e270]:
                          - generic [ref=e271]: Variant
                          - strong [ref=e272]: Zombie
                        - generic [ref=e273]:
                          - generic [ref=e274]: Footprint
                          - strong [ref=e275]: Standard
                        - generic [ref=e276]:
                          - generic [ref=e277]: Job
                          - strong [ref=e278]: Brute
                        - generic [ref=e279]:
                          - generic [ref=e280]: CR
                          - strong [ref=e281]: "5"
                        - generic [ref=e282]:
                          - generic [ref=e283]: Tier
                          - strong [ref=e284]: Normal
                        - generic [ref=e285]:
                          - generic [ref=e286]: Tempo
                          - strong [ref=e287]: Standard
                        - generic [ref=e288]:
                          - generic [ref=e289]: Danger
                          - strong [ref=e290]: Hard
                      - generic [ref=e291]:
                        - generic [ref=e293]:
                          - generic [ref=e294]: Pressure
                          - strong [ref=e295]: 0 / 16
                        - generic [ref=e298]:
                          - generic [ref=e299]: Complexity
                          - strong [ref=e300]: 0 / 8
                  - generic:
                    - region "Build flow":
                      - generic [ref=e302]:
                        - generic [ref=e303]:
                          - generic [ref=e304]:
                            - generic [ref=e305]: Next Best Action
                            - strong [ref=e306]: Add Body
                            - paragraph [ref=e307]: Define what the creature physically is before choosing attacks.
                          - button [ref=e308] [cursor=pointer]: Open Body Slot
                        - generic [ref=e309]:
                          - button [ref=e310] [cursor=pointer]:
                            - img [ref=e311]
                          - navigation [ref=e313]:
                            - button [ref=e314] [cursor=pointer]:
                              - generic [ref=e315]: "1"
                              - generic: Start
                            - button [ref=e316] [cursor=pointer]:
                              - generic [ref=e317]: "2"
                              - generic: Body
                            - button [ref=e318] [cursor=pointer]:
                              - generic [ref=e319]: "3"
                              - generic: Attack
                            - button [ref=e320] [cursor=pointer]:
                              - generic [ref=e321]: "4"
                              - generic: Tell
                            - button [ref=e322] [cursor=pointer]:
                              - generic [ref=e323]: "5"
                              - generic: Complete
                            - button [ref=e324] [cursor=pointer]:
                              - generic [ref=e325]: "6"
                              - generic: Review
                            - button [ref=e326] [cursor=pointer]:
                              - generic [ref=e327]: "7"
                              - generic: Export
                          - button [ref=e328] [cursor=pointer]:
                            - img [ref=e329]
                        - generic [ref=e331]:
                          - generic [ref=e332]:
                            - generic [ref=e333]:
                              - img [ref=e334]
                              - generic [ref=e336]: Playable Draft
                            - generic [ref=e337]:
                              - img [ref=e338]
                              - generic [ref=e340]: Complete Monster
                            - generic [ref=e341]:
                              - img [ref=e342]
                              - generic [ref=e344]: Setpiece Ready
                            - generic [ref=e345]:
                              - img [ref=e346]
                              - generic [ref=e348]: Export Ready
                          - generic [ref=e349]:
                            - generic [ref=e350]:
                              - img [ref=e351]
                              - generic [ref=e353]: No Weakness / Tell selected. Add counterplay before using this as horror, otherwise it may feel arbitrary.
                            - generic [ref=e354]:
                              - img [ref=e355]
                              - generic [ref=e357]: "Counterplay Audit: Missing Weakness / Tell. Add at least one explicit player-facing answer before using this as a horror monster."
                      - button "Monster Frame Body 17% 2 warnings" [ref=e358] [cursor=pointer]:
                        - generic [ref=e359]:
                          - strong [ref=e360]: Monster Frame
                          - emphasis [ref=e361]: Body
                        - generic [ref=e362]:
                          - generic [ref=e363]: 17%
                          - generic [ref=e364]: 2 warnings
                        - img [ref=e365]
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
> 55 |     .click();
     |      ^ Error: locator.click: Test timeout of 30000ms exceeded.
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