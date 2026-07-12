import { expect } from "@playwright/test";

export async function inspectScrollChain(locator) {
  return locator.evaluate((element) => {
    const chain = [];
    for (let node = element; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      chain.push({
        tag: node.tagName.toLowerCase(),
        id: node.id || null,
        className: typeof node.className === "string" ? node.className : null,
        overflowY: style.overflowY,
        scrollable: node.scrollHeight > node.clientHeight + 1,
        scrollHeight: node.scrollHeight,
        clientHeight: node.clientHeight,
      });
    }
    return chain;
  });
}

export async function expectVerticalScrollOwner(locator, { allowScrollableAncestors = 0 } = {}) {
  const chain = await inspectScrollChain(locator);
  expect(["auto", "scroll"]).toContain(chain[0].overflowY);
  expect(chain[0].scrollable).toBe(true);
  const competing = chain.slice(1).filter((entry) =>
    entry.scrollable && ["auto", "scroll"].includes(entry.overflowY),
  );
  expect(competing.length).toBeLessThanOrEqual(allowScrollableAncestors);
  return chain;
}

export async function expectWheelMovesOwner(page, locator) {
  await locator.evaluate((element) => { element.scrollTop = 0; });
  const bodyBefore = await page.evaluate(() => document.scrollingElement?.scrollTop || 0);
  await locator.hover();
  await page.mouse.wheel(0, 500);
  await expect.poll(() => locator.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.scrollingElement?.scrollTop || 0)).toBe(bodyBefore);
}
