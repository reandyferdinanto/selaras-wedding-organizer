import { expect, test } from "@playwright/test";

test("home page renders the public wedding planner experience", async ({
  page,
}, testInfo) => {
  const consoleErrors: string[] = [];

  page.on("console", (message) => {
    const text = message.text();

    if (text.includes("/_next/webpack-hmr")) {
      return;
    }

    if (message.type() === "error") {
      consoleErrors.push(text);
    }
  });

  await page.goto("/");
  await expect(page).toHaveTitle(/Selaras Wedding Planner/);
  await expect(
    page.getByRole("heading", {
      name: /Rencana pernikahan yang rapi/i,
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Mulai project/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Masuk$/i })).toBeVisible();

  await page.screenshot({
    path: testInfo.outputPath("home-page.png"),
    fullPage: true,
  });

  expect(consoleErrors).toEqual([]);
});

test("dashboard menu stays readable on mobile", async ({ page }, testInfo) => {
  await page.context().addCookies([
    {
      name: "selaras-demo-session",
      value: "demo@selaras.app",
      domain: "localhost",
      path: "/",
      sameSite: "Lax",
    },
  ]);

  await page.goto("/dashboard");
  await expect(page.getByText("Menu utama")).toBeVisible();
  await expect(page.getByRole("link", { name: /Data acara/i })).toBeVisible();
  await expect(page.getByText("Pantau tiap langkah dengan lebih tenang")).toBeVisible();

  const overlappingNavRows = await page.locator(".dashboard-nav-link").evaluateAll((links) =>
    links
      .map((link, index) => {
        const row = link.querySelector(".dashboard-nav-row");
        const step = row?.querySelector(".dashboard-nav-step");
        const chip = row?.querySelector(".dashboard-status-chip");

        if (!row || !step || !chip) return null;

        const stepRect = step.getBoundingClientRect();
        const chipRect = chip.getBoundingClientRect();

        return stepRect.right > chipRect.left ? index : null;
      })
      .filter((index) => index !== null),
  );

  expect(overlappingNavRows).toEqual([]);

  await page.screenshot({
    path: testInfo.outputPath("dashboard-mobile-menu.png"),
    fullPage: true,
  });
});

test("auth pages render balanced illustration panels", async ({ page }, testInfo) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: /Masuk untuk melanjutkan/i }),
  ).toBeVisible();
  await expect(page.locator(".auth-illustration-panel")).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("login-page.png"),
    fullPage: true,
  });

  await page.goto("/register");
  await expect(
    page.getByRole("heading", {
      name: /Mulai workspace pernikahan dari fondasi/i,
    }),
  ).toBeVisible();
  await expect(page.locator(".auth-illustration-panel")).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("register-page.png"),
    fullPage: true,
  });
});
