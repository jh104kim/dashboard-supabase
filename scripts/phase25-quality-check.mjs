import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const baseUrl = process.env.PHASE25_BASE_URL ?? "http://localhost:3000";
const outputDir = "quality-artifacts/phase25";

function getBrowserOptions() {
  if (process.platform === "win32") {
    return { channel: "msedge" };
  }

  return {};
}

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch(getBrowserOptions());
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
const results = [];

function pushResult(name, pass, detail) {
  results.push({ name, pass, detail });
}

let response = await page.goto(`${baseUrl}/review`, { waitUntil: "networkidle" });
pushResult("review route status", response?.status() === 200, response?.status() ?? 0);

const requiredReviewText = [
  "1. Baseline",
  "2. Today Input",
  "3. Gap",
  "4. Next Action",
  "Compressor Domain Expertise",
  "Full-stack Productization",
  "Public Evidence Pipeline",
  "Private Life Axes",
  "Health and Energy Foundation",
  "Financial Freedom Track",
  "Private finance target configured locally",
  "Private health baseline configured locally",
  "제품화 gap",
];

const initialBody = await page.locator("body").innerText();
for (const text of requiredReviewText) {
  pushResult(`review contains ${text}`, initialBody.includes(text), text);
}

await page.screenshot({ path: `${outputDir}/desktop-review-baseline.png`, fullPage: true });

await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
await page.getByLabel("오늘 우선순위 제목").fill("Baseline gap 줄이기");
await page.getByLabel("오늘 우선순위 설명").fill("Review를 baseline/input/gap/next action 구조로 바꾸기");
await page.getByLabel("연결 가치").selectOption("통합");
await page.getByRole("button", { name: "추가", exact: true }).click();
await page.getByLabel("Baseline gap 줄이기 상태").selectOption("done");
await page.getByRole("button", { name: "회고" }).click();
await page.getByLabel("Quick capture").fill("Review는 입력값의 재표시가 아니라 현재 수준과 행동의 차이를 보여줘야 한다.");
await page.getByRole("button", { name: "Capture" }).click();
await page.getByLabel("Next one").fill("다음에는 Supabase 저장 전에 모바일 compact mode를 판단한다.");

await page.getByRole("link", { name: "Review" }).click();
await page.waitForURL(`${baseUrl}/review`);
const updatedBody = await page.locator("body").innerText();

pushResult(
  "review receives completed baseline task",
  updatedBody.includes("Baseline gap 줄이기"),
  "completed task appears in review",
);
pushResult(
  "review receives baseline capture",
  updatedBody.includes("Review는 입력값의 재표시가 아니라 현재 수준과 행동의 차이를 보여줘야 한다."),
  "capture appears in review",
);
const nextOneValue = await page.getByLabel("다음 주 하나의 개선점").inputValue();
pushResult(
  "review receives next action",
  nextOneValue === "다음에는 Supabase 저장 전에 모바일 compact mode를 판단한다.",
  nextOneValue,
);

await page.screenshot({ path: `${outputDir}/desktop-review-after-baseline-input.png`, fullPage: true });

const mobilePage = await browser.newPage({ viewport: { width: 390, height: 1000 } });
await mobilePage.goto(`${baseUrl}/review`, { waitUntil: "networkidle" });
const horizontalOverflow = await mobilePage.evaluate(() => {
  return document.documentElement.scrollWidth > document.documentElement.clientWidth;
});
const mobileBody = await mobilePage.locator("body").innerText();
pushResult("mobile review no horizontal overflow", !horizontalOverflow, horizontalOverflow);
pushResult("mobile review contains baseline", mobileBody.includes("1. Baseline"), "baseline visible");
await mobilePage.screenshot({ path: `${outputDir}/mobile-review-baseline.png`, fullPage: true });
await mobilePage.close();

await browser.close();

const summary = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  pass: results.every((result) => result.pass),
  results,
};

await writeFile(`${outputDir}/phase25-quality-report.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));

if (!summary.pass) {
  process.exitCode = 1;
}
