import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const baseUrl = process.env.PHASE4_BASE_URL ?? "http://localhost:3000";
const outputDir = "quality-artifacts/phase4";

function getBrowserOptions() {
  if (process.platform === "win32") {
    return { channel: "msedge" };
  }

  return {};
}

function push(results, name, pass, detail) {
  results.push({ name, pass, detail });
}

await mkdir(outputDir, { recursive: true });

const results = [];
const browser = await chromium.launch(getBrowserOptions());
const page = await browser.newPage({ viewport: { width: 1440, height: 1300 } });
const testTaskTitle = `Phase 4 Review Intelligence Test ${Date.now()}`;

let response = await page.goto(baseUrl, { waitUntil: "networkidle" });
push(results, "today route status", response?.status() === 200, response?.status() ?? 0);

await page.getByLabel("오늘 우선순위 제목").fill(testTaskTitle);
await page
  .getByLabel("오늘 우선순위 설명")
  .fill("aggregation layer가 Review snapshot으로 이어져야 한다");
await page.getByLabel("연결 가치").selectOption("통합");
await page.getByRole("button", { name: "추가", exact: true }).click();
await page.getByText(testTaskTitle).last().waitFor();
await page.waitForTimeout(1800);

const todayBody = await page.locator("body").innerText();
push(
  results,
  "task save status visible",
  todayBody.includes("Task 저장 완료"),
  todayBody.includes("Task 저장 완료") ? "Task 저장 완료" : "save status missing",
);

await page.getByLabel("Quick capture").fill(
  "Phase 4는 저장된 task와 capture를 해석해 다음 행동 하나를 추천해야 한다.",
);
await page.getByRole("button", { name: "Capture" }).click();
await page.waitForTimeout(1200);

await page.getByRole("link", { name: "Review" }).click();
await page.waitForURL(`${baseUrl}/review`);
const reviewBody = await page.locator("body").innerText();

const requiredReviewText = [
  "Generated Review Intelligence",
  "Alignment diagnosis",
  "Best aligned action",
  "Next one improvement",
  "Weekly Review Outputs",
  testTaskTitle,
];

for (const text of requiredReviewText) {
  push(results, `review contains ${text}`, reviewBody.includes(text), text);
}

await page.getByRole("button", { name: "Generate Review Snapshot" }).click();
const generatedBody = await page.locator("body").innerText();
push(
  results,
  "generated snapshot message visible",
  generatedBody.includes("Generated snapshot이 Review draft에 반영됐다."),
  "generated snapshot acknowledgement",
);

const nextOneValue = await page.getByLabel("다음 주 하나의 개선점").inputValue();
push(
  results,
  "generated next action is not empty",
  nextOneValue.trim().length > 0,
  nextOneValue,
);

await page.getByRole("button", { name: "Save Review Snapshot" }).click();
await page.waitForTimeout(1800);
const afterSaveBody = await page.locator("body").innerText();
push(
  results,
  "review snapshot save status",
  afterSaveBody.includes("Review snapshot 저장 완료"),
  afterSaveBody.includes("Review snapshot 저장 완료")
    ? "Review snapshot 저장 완료"
    : "review save status missing",
);

await page.screenshot({ path: `${outputDir}/desktop-review-intelligence.png`, fullPage: true });

const mobilePage = await browser.newPage({ viewport: { width: 390, height: 1100 } });
await mobilePage.goto(`${baseUrl}/review`, { waitUntil: "networkidle" });
const mobileBody = await mobilePage.locator("body").innerText();
const horizontalOverflow = await mobilePage.evaluate(() => {
  return document.documentElement.scrollWidth > document.documentElement.clientWidth;
});
push(results, "mobile review no horizontal overflow", !horizontalOverflow, horizontalOverflow);
push(
  results,
  "mobile review contains generated intelligence",
  mobileBody.includes("Generated Review Intelligence"),
  "Generated Review Intelligence",
);
await mobilePage.screenshot({ path: `${outputDir}/mobile-review-intelligence.png`, fullPage: true });
await mobilePage.close();

await browser.close();

const summary = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  pass: results.every((result) => result.pass),
  results,
};

await writeFile(`${outputDir}/phase4-quality-report.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));

if (!summary.pass) {
  process.exitCode = 1;
}
