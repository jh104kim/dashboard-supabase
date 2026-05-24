import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const baseUrl = process.env.PHASE5_BASE_URL ?? "http://localhost:3000";
const password = process.env.PHASE5_APP_PASSWORD ?? process.env.APP_PASSWORD;
const outputDir = "quality-artifacts/phase5";

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
push(results, "password configured for test", Boolean(password), Boolean(password));

const browser = await chromium.launch(getBrowserOptions());
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });

await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
push(results, "root redirects to gate", page.url().includes("/gate"), page.url());

const gateBody = await page.locator("body").innerText();
push(
  results,
  "gate page visible",
  gateBody.includes("Private preview locked"),
  "Private preview locked",
);

await page.getByLabel("Sapporo Polar password").fill("0000");
await page.getByRole("button", { name: "Unlock" }).click();
await page.waitForURL(/\/gate.*error=1/, { timeout: 10000 });
const wrongBody = await page.locator("body").innerText();
push(
  results,
  "wrong password rejected",
  wrongBody.includes("비밀번호가 맞지 않습니다."),
  "error visible",
);

if (password) {
  await page.getByLabel("Sapporo Polar password").fill(password);
  await page.getByRole("button", { name: "Unlock" }).click();
  await page.waitForURL(`${baseUrl}/`, { timeout: 10000 });
  const unlockedBody = await page.locator("body").innerText();
  push(
    results,
    "correct password unlocks app",
    unlockedBody.includes("TODAY DASHBOARD") || unlockedBody.includes("오늘 나를 다시 정렬하는 화면"),
    "today dashboard visible",
  );
}

await page.screenshot({ path: `${outputDir}/desktop-after-unlock.png`, fullPage: true });
await browser.close();

const summary = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  pass: results.every((result) => result.pass),
  results,
};

await writeFile(`${outputDir}/phase5-security-report.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));

if (!summary.pass) {
  process.exitCode = 1;
}
