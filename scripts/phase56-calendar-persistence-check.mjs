import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const baseUrl = process.env.PHASE56_BASE_URL ?? "http://localhost:3000";
const outputDir = "quality-artifacts/phase56";

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

  const password =
    process.env.QUALITY_APP_PASSWORD ??
    process.env.PHASE56_APP_PASSWORD ??
    process.env.APP_PASSWORD;

  if (!password) {
    return "gate shown, password env not set";
  }

  await page.getByLabel("Sapporo Polar password").fill(password);
  await page.getByRole("button", { name: "Unlock" }).click();
  await page.waitForURL(`${baseUrl}/`);
  return "unlocked";
}

await mkdir(outputDir, { recursive: true });

const results = [];
const browser = await chromium.launch(getBrowserOptions());
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
const testEventTitle = `Phase 5.6 Persisted Calendar Block ${Date.now()}`;

const response = await page.goto(baseUrl, { waitUntil: "networkidle" });
const unlockStatus = await unlockIfNeeded(page);
push(
  results,
  "today route available",
  response?.status() === 200 || unlockStatus === "unlocked",
  `${response?.status() ?? 0}, ${unlockStatus}`,
);

await page.getByText("Calendar Planning").waitFor();
await page.getByLabel("일정 제목").fill(testEventTitle);
await page.getByLabel("일정 시작 시간").fill("15:00");
await page.getByLabel("일정 종료 시간").fill("15:45");
await page.getByLabel("일정 영역").selectOption("learning");
await page.getByLabel("일정 연결 가치").selectOption("성장");
await page.getByLabel("일정 의도").fill("calendar persistence test");
await page.getByRole("button", { name: "일정 추가" }).click();
await page.waitForFunction(
  (title) => document.body.innerText.includes(title),
  testEventTitle,
);
await page.waitForTimeout(2200);

let body = await page.locator("body").innerText();
push(
  results,
  "calendar event saved",
  body.includes("Calendar event 저장 완료"),
  body.includes("Calendar event 저장 완료")
    ? "Calendar event 저장 완료"
    : "calendar save status missing",
);
push(
  results,
  "no calendar local-only warning",
  !body.includes("Calendar local-only") && !body.includes("Calendar 저장 실패"),
  "calendar persistence path is active",
);

await page.reload({ waitUntil: "networkidle" });
await page.getByText("Calendar Planning").waitFor();
await page.waitForFunction(
  (title) => document.body.innerText.includes(title),
  testEventTitle,
  { timeout: 10000 },
);
body = await page.locator("body").innerText();
push(
  results,
  "calendar event survives reload",
  body.includes(testEventTitle),
  testEventTitle,
);

await page.getByRole("link", { name: "Review" }).click();
await page.waitForURL(`${baseUrl}/review`);
body = await page.locator("body").innerText();
push(
  results,
  "review sees persisted calendar data",
  body.includes("Time-use signal") && body.includes("Calendar alignment"),
  "review calendar intelligence visible",
);

await page.screenshot({
  path: `${outputDir}/desktop-calendar-persistence-review.png`,
  fullPage: true,
});
await browser.close();

const summary = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  pass: results.every((result) => result.pass),
  results,
};

await writeFile(`${outputDir}/phase56-quality-report.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));

if (!summary.pass) {
  process.exitCode = 1;
}
