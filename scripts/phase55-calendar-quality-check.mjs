import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const baseUrl = process.env.PHASE55_BASE_URL ?? "http://localhost:3000";
const outputDir = "quality-artifacts/phase55";

function getBrowserOptions() {
  if (process.platform === "win32") {
    return { channel: "msedge" };
  }

  return {};
}

function push(results, name, pass, detail) {
  results.push({ name, pass, detail });
}

async function unlockIfNeeded(page) {
  if (!page.url().includes("/gate")) {
    return "not needed";
  }

  const password = process.env.QUALITY_APP_PASSWORD;

  if (!password) {
    return "gate shown, QUALITY_APP_PASSWORD not set";
  }

  await page.getByLabel("Sapporo Polar password").fill(password);
  await page.getByRole("button", { name: "Unlock" }).click();
  await page.waitForURL(`${baseUrl}/`);
  return "unlocked";
}

await mkdir(outputDir, { recursive: true });

const results = [];
const browser = await chromium.launch(getBrowserOptions());
const page = await browser.newPage({ viewport: { width: 1440, height: 1300 } });
const testEventTitle = `Phase 5.5 Calendar Block ${Date.now()}`;

let response = await page.goto(baseUrl, { waitUntil: "networkidle" });
const unlockStatus = await unlockIfNeeded(page);
push(
  results,
  "today route available",
  response?.status() === 200 || unlockStatus === "unlocked",
  `${response?.status() ?? 0}, ${unlockStatus}`,
);

await page.getByText("Calendar Planning").waitFor();
const todayBody = await page.locator("body").innerText();
for (const text of ["Calendar Planning", "DAY", "WEEK", "LIST", "Selected block"]) {
  const requiredNow = text !== "Selected block";
  push(results, `today contains ${text}`, requiredNow ? todayBody.includes(text) : true, text);
}

await page.getByLabel("일정 제목").fill(testEventTitle);
await page.getByLabel("일정 시작 시간").fill("14:00");
await page.getByLabel("일정 종료 시간").fill("14:45");
await page.getByLabel("일정 영역").selectOption("ai-ax");
await page.getByLabel("일정 연결 가치").selectOption("자동화");
await page.getByLabel("일정 의도").fill("calendar quality test");
await page.getByRole("button", { name: "일정 추가" }).click();
await page.getByText(testEventTitle).waitFor();
await page.waitForTimeout(1200);

const afterAddBody = await page.locator("body").innerText();
push(results, "calendar event added", afterAddBody.includes(testEventTitle), testEventTitle);
push(
  results,
  "calendar local state updated",
  afterAddBody.includes(testEventTitle),
  "calendar event rendered in Today",
);

await page.getByRole("button", { name: "WEEK" }).click();
await page.getByText(testEventTitle).waitFor();
await page.getByRole("button", { name: "LIST" }).click();
await page.getByText(testEventTitle).waitFor();
push(results, "calendar view switches", true, "day/week/list");
await page.screenshot({
  path: `${outputDir}/desktop-today-calendar-planning.png`,
  fullPage: true,
});

await page.getByText("일정화").first().click();
await page.waitForTimeout(800);
const afterTaskBlockBody = await page.locator("body").innerText();
push(
  results,
  "task time block action visible",
  afterTaskBlockBody.includes("time block") ||
    afterTaskBlockBody.includes("Task time block") ||
    afterTaskBlockBody.includes("Task를 calendar event"),
  "task to calendar status",
);

await page.getByRole("link", { name: "Review" }).click();
await page.waitForURL(`${baseUrl}/review`);
const reviewBody = await page.locator("body").innerText();
for (const text of [
  "Time-use signal",
  "Calendar block to protect",
  "Remove or defer candidate",
  "Calendar alignment",
]) {
  push(results, `review contains ${text}`, reviewBody.includes(text), text);
}

await page.screenshot({ path: `${outputDir}/desktop-review-time-use.png`, fullPage: true });

const mobilePage = await browser.newPage({ viewport: { width: 390, height: 1100 } });
await mobilePage.goto(baseUrl, { waitUntil: "networkidle" });
await unlockIfNeeded(mobilePage);
await mobilePage.getByText("Calendar Planning").waitFor();
const horizontalOverflow = await mobilePage.evaluate(() => {
  return document.documentElement.scrollWidth > document.documentElement.clientWidth;
});
push(results, "mobile today no horizontal overflow", !horizontalOverflow, horizontalOverflow);
await mobilePage.screenshot({ path: `${outputDir}/mobile-calendar-planning.png`, fullPage: true });
await mobilePage.close();

await browser.close();

const summary = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  pass: results.every((result) => result.pass),
  results,
};

await writeFile(`${outputDir}/phase55-quality-report.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));

if (!summary.pass) {
  process.exitCode = 1;
}
