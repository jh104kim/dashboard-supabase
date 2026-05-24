import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const baseUrl = process.env.PHASE2_BASE_URL ?? "http://localhost:3000";
const outputDir = "quality-artifacts/phase2";

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

const response = await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
pushResult("today route status", response?.status() === 200, response?.status() ?? 0);

await page.getByLabel("오늘 우선순위 제목").fill("Phase 2 입력 루프 테스트");
await page.getByLabel("오늘 우선순위 설명").fill("입력한 task가 alignment와 review에 반영되는지 확인");
await page.getByLabel("연결 가치").selectOption("자동화");
await page.getByRole("button", { name: "추가", exact: true }).click();
await page.getByText("Phase 2 입력 루프 테스트").waitFor();

const addedTaskVisible = await page.getByText("Phase 2 입력 루프 테스트").isVisible();
pushResult("priority input appears", addedTaskVisible, "added priority is visible");

await page
  .getByLabel("Phase 2 입력 루프 테스트 상태")
  .selectOption("done");
const evidenceText = await page.getByText("완료 evidence 후보: 1개", { exact: false }).isVisible();
pushResult("task status updates evidence count", evidenceText, "done status updates evidence count");

await page.getByLabel("일정 시간대").fill("오후");
await page.getByLabel("일정 제목").fill("Phase 2 품질점검");
await page.getByLabel("일정 의도").fill("30분");
await page.getByRole("button", { name: "일정 추가" }).click();
await page.getByText("Phase 2 품질점검").waitFor();
pushResult("schedule input appears", true, "added schedule is visible");

await page.getByLabel("에너지 점수").fill("72");
await page.getByLabel("에너지 이유").fill("오전 집중도가 높고 회복 행동이 명확함");
const energyUpdated = await page.getByText(/^72%$/).first().isVisible();
pushResult("energy score updates metric", energyUpdated, "energy metric updates");

await page.getByRole("button", { name: "회고" }).click();
await page.getByLabel("Quick capture").fill("오늘 입력 루프는 충분히 단순해야 매일 쓸 수 있다.");
await page.getByRole("button", { name: "Capture" }).click();
await page.getByText("오늘 입력 루프는 충분히 단순해야 매일 쓸 수 있다.").waitFor();
pushResult("quick capture appears", true, "capture is visible on Today");

await page.getByLabel("Next one").fill("내일은 저장 흐름 하나만 Supabase로 연결한다.");
await page.screenshot({ path: `${outputDir}/desktop-today-after-input.png`, fullPage: true });

await page.getByRole("link", { name: "Review" }).click();
await page.waitForURL(`${baseUrl}/review`);
await page.getByText("1개 완료 task: Phase 2 입력 루프 테스트").waitFor();

const reviewEvidenceVisible = await page
  .getByText("1개 완료 task: Phase 2 입력 루프 테스트")
  .isVisible();
const reviewCaptureVisible = await page
  .getByText("오늘 입력 루프는 충분히 단순해야 매일 쓸 수 있다.")
  .isVisible();
const reviewNextOneValue = await page
  .getByLabel("다음 주 하나의 개선점")
  .inputValue();

pushResult("review preview receives evidence", reviewEvidenceVisible, "done task appears in review evidence");
pushResult("review preview receives capture", reviewCaptureVisible, "latest capture appears as insight");
pushResult(
  "review next one receives draft",
  reviewNextOneValue === "내일은 저장 흐름 하나만 Supabase로 연결한다.",
  reviewNextOneValue,
);

await page.screenshot({ path: `${outputDir}/desktop-review-after-input.png`, fullPage: true });

await page.reload({ waitUntil: "networkidle" });
const resetNotice = await page.getByText("local-only 흐름으로 자기 정렬 구조를 검증한다", { exact: false }).isVisible();
pushResult("local-only policy visible", resetNotice, "review explains no persistence");

const mobilePage = await browser.newPage({ viewport: { width: 390, height: 1000 } });
await mobilePage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
const horizontalOverflow = await mobilePage.evaluate(() => {
  return document.documentElement.scrollWidth > document.documentElement.clientWidth;
});
await mobilePage.screenshot({ path: `${outputDir}/mobile-today.png`, fullPage: true });
pushResult("mobile no horizontal overflow", !horizontalOverflow, horizontalOverflow);
await mobilePage.close();

await browser.close();

const summary = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  pass: results.every((result) => result.pass),
  results,
};

await writeFile(`${outputDir}/phase2-quality-report.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));

if (!summary.pass) {
  process.exitCode = 1;
}
