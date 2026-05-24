import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const baseUrl = process.env.PHASE1_BASE_URL ?? "http://localhost:3000";
const outputDir = "quality-artifacts/phase1";

const routes = [
  { path: "/", name: "today" },
  { path: "/north-star", name: "north-star" },
  { path: "/review", name: "review" },
];

const viewports = [
  { name: "desktop", width: 1440, height: 1100 },
  { name: "mobile", width: 390, height: 1000 },
];

function getBrowserOptions() {
  if (process.platform === "win32") {
    return { channel: "msedge" };
  }

  return {};
}

function normalizePath(path) {
  return path === "/" ? "/" : path;
}

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch(getBrowserOptions());
const results = [];

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });

  for (const route of routes) {
    const url = `${baseUrl}${normalizePath(route.path)}`;
    const response = await page.goto(url, { waitUntil: "networkidle" });
    const status = response?.status() ?? 0;
    const title = await page.title();
    const h1 = await page.locator("h1").first().textContent();
    const bodyText = await page.locator("body").innerText();

    const horizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    const clippedTextCandidates = await page.evaluate(() => {
      const elements = [...document.querySelectorAll("h1, h2, h3, p, span, a, div")];
      return elements
        .filter((element) => {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          const className = typeof element.className === "string" ? element.className : "";
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            !className.includes("sr-only") &&
            style.overflow === "hidden" &&
            element.scrollWidth > element.clientWidth + 1
          );
        })
        .slice(0, 10)
        .map((element) => element.textContent?.trim().slice(0, 80));
    });

    const screenshotPath = `${outputDir}/${viewport.name}-${route.name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });

    let privateUnlock = null;
    if (route.name === "north-star") {
      const lockedTextVisible = bodyText.includes("Private cockpit locked");
      const privateNumbersHidden =
        !bodyText.includes("Private target") &&
        !bodyText.includes("Private current value");

      const cockpitKey =
        process.env.PHASE1_COCKPIT_KEY ?? process.env.NEXT_PUBLIC_COCKPIT_KEY;
      let unlockSucceeded = true;
      let hideSucceeded = true;
      let unlockedScreenshotPath = null;
      let relockedScreenshotPath = null;

      if (cockpitKey) {
        await page.locator("#private-track-key").fill(cockpitKey);
        await page.getByRole("button", { name: "Unlock private tracks" }).click();
        await page.getByText("Unlocked private cockpit").waitFor();

        const unlockedBodyText = await page.locator("body").innerText();
        unlockedScreenshotPath = `${outputDir}/${viewport.name}-${route.name}-unlocked.png`;
        await page.screenshot({ path: unlockedScreenshotPath, fullPage: true });

        await page.getByRole("button", { name: "Hide private tracks" }).click();
        await page.getByText("Private cockpit locked").waitFor();
        const relockedBodyText = await page.locator("body").innerText();
        relockedScreenshotPath = `${outputDir}/${viewport.name}-${route.name}-relocked.png`;
        await page.screenshot({ path: relockedScreenshotPath, fullPage: true });

        unlockSucceeded =
          unlockedBodyText.includes("Private target") &&
          unlockedBodyText.includes("Private current value");
        hideSucceeded =
          relockedBodyText.includes("Private cockpit locked") &&
          !relockedBodyText.includes("Private target") &&
          !relockedBodyText.includes("Private current value");
      }

      privateUnlock = {
        lockedTextVisible,
        privateNumbersHidden,
        unlockSucceeded,
        hideSucceeded,
        unlockedScreenshotPath,
        relockedScreenshotPath,
      };
    }

    const requiredText = {
      today: ["오늘", "북극성", "우선순위"],
      "north-star": ["북극성", "Private Financial Track", "Private Health Track"],
      review: ["Weekly Review", "자기 정렬"],
    }[route.name];

    const missingText = requiredText.filter((text) => !bodyText.includes(text));

    results.push({
      route: route.path,
      viewport: viewport.name,
      status,
      title,
      h1,
      horizontalOverflow,
      clippedTextCandidates,
      missingText,
      privateUnlock,
      screenshotPath,
      pass:
        status === 200 &&
        !horizontalOverflow &&
        clippedTextCandidates.length === 0 &&
        missingText.length === 0 &&
        (privateUnlock === null ||
          (privateUnlock.lockedTextVisible &&
            privateUnlock.privateNumbersHidden &&
            privateUnlock.unlockSucceeded &&
            privateUnlock.hideSucceeded)),
    });
  }

  await page.close();
}

await browser.close();

const summary = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  pass: results.every((result) => result.pass),
  results,
};

await writeFile(`${outputDir}/phase1-quality-report.json`, JSON.stringify(summary, null, 2));

console.log(JSON.stringify(summary, null, 2));

if (!summary.pass) {
  process.exitCode = 1;
}
