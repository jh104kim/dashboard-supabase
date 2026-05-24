import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.PHASE3_BASE_URL ?? "http://localhost:3000";
const outputDir = "quality-artifacts/phase3";

function getBrowserOptions() {
  if (process.platform === "win32") {
    return { channel: "msedge" };
  }

  return {};
}

function parseEnv(text) {
  return Object.fromEntries(
    text
      .split(/\r?\n/)
      .filter((line) => /^\s*[^#=]+=/.test(line))
      .map((line) => {
        const idx = line.indexOf("=");
        return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
      }),
  );
}

function push(results, name, pass, detail) {
  results.push({ name, pass, detail });
}

await mkdir(outputDir, { recursive: true });

const results = [];
let env = {};

try {
  env = parseEnv(await readFile(path.join(process.cwd(), ".env"), "utf8"));
} catch {
  push(results, "env file exists", false, ".env not found");
}

const requiredKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

for (const key of requiredKeys) {
  push(results, `env has ${key}`, Boolean(env[key]), Boolean(env[key]));
}

let supabaseRestOk = false;

if (env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const tables = ["tasks", "reflections", "learning_logs", "reviews"];

  for (const table of tables) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=id&limit=1`, {
        headers: {
          apikey: anonKey,
          authorization: `Bearer ${anonKey}`,
        },
      });
      const tableOk = res.ok;
      push(results, `supabase table ${table}`, tableOk, { status: res.status });
      supabaseRestOk = supabaseRestOk || tableOk;
    } catch (error) {
      push(
        results,
        `supabase table ${table}`,
        false,
        error instanceof Error ? error.message : "fetch failed",
      );
    }
  }
}

const browser = await chromium.launch(getBrowserOptions());
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
const response = await page.goto(baseUrl, { waitUntil: "networkidle" });
push(results, "today route status", response?.status() === 200, response?.status() ?? 0);

const body = await page.locator("body").innerText();
push(results, "persistence panel visible", body.includes("Persistence"), "Persistence panel");

await page.getByLabel("오늘 우선순위 제목").fill("Phase 3 Supabase 저장 테스트");
await page.getByLabel("오늘 우선순위 설명").fill("새로고침 후 Supabase에서 다시 불러올 수 있어야 한다");
await page.getByLabel("연결 가치").selectOption("자동화");
await page.getByRole("button", { name: "추가", exact: true }).click();
await page.getByText("Phase 3 Supabase 저장 테스트").waitFor();
await page
  .locator("body")
  .waitFor({ state: "visible" });
await page.waitForTimeout(1500);

await page.screenshot({ path: `${outputDir}/desktop-today-persistence.png`, fullPage: true });

const afterInputBody = await page.locator("body").innerText();
const saveSucceeded = afterInputBody.includes("Task 저장 완료");
const saveFailed = afterInputBody.includes("Task 저장 실패");

push(
  results,
  "input visible after add",
  afterInputBody.includes("Phase 3 Supabase 저장 테스트"),
  "task visible",
);
push(
  results,
  "task save status",
  saveSucceeded && !saveFailed,
  saveSucceeded ? "Task 저장 완료" : "Task 저장 실패 또는 저장 완료 메시지 없음",
);

if (supabaseRestOk) {
  await page.waitForTimeout(2500);
  await page.reload({ waitUntil: "networkidle" });
  const afterReloadBody = await page.locator("body").innerText();
  push(
    results,
    "task survives reload",
    afterReloadBody.includes("Phase 3 Supabase 저장 테스트"),
    "task should be loaded from Supabase",
  );
}

await browser.close();

const summary = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  pass: results.every((result) => result.pass),
  results,
};

await writeFile(`${outputDir}/phase3-quality-report.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));

if (!summary.pass) {
  process.exitCode = 1;
}
