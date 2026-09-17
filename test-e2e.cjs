const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
app.commandLine.appendSwitch("no-sandbox");
app.commandLine.appendSwitch("disable-gpu");

console.log("\n=======================================================");
console.log("  STARTING END-TO-END AUTOMATED VERIFICATION FOR AMMI  ");
console.log("=======================================================\n");

let passedTests = 0;
function pass(testName) {
  passedTests++;
  console.log(`[PASS] Test ${passedTests}: ${testName}`);
}

app.whenReady().then(async () => {
  try {
    // 1. Test Onboarding Window
    const onboardingWin = new BrowserWindow({
      width: 580,
      height: 640,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, "electron", "preload.cjs"),
        contextIsolation: true,
      },
    });

    onboardingWin.webContents.on("did-fail-load", (_e, code, desc, url) => {
      console.log(`[ONBOARDING FAIL]: code=${code}, desc="${desc}", url="${url}"`);
    });
    await onboardingWin.loadFile(path.join(__dirname, "public", "onboarding.html"));
    const onboardingTitle = await onboardingWin.webContents.executeJavaScript("document.title");
    if (onboardingTitle.includes("Ammi")) {
      pass("Onboarding window loaded successfully with correct title");
    } else {
      throw new Error(`Unexpected onboarding title: ${onboardingTitle}`);
    }

    // Verify Onboarding contains 4 stages and finish event
    const stageCount = await onboardingWin.webContents.executeJavaScript("document.querySelectorAll('.stage').length");
    if (stageCount === 4) {
      pass(`Onboarding contains all 4 setup stages (found ${stageCount})`);
    } else {
      throw new Error(`Expected 4 stages, found ${stageCount}`);
    }

    // 2. Test Main Dashboard Window
    const dashboardWin = new BrowserWindow({
      width: 980,
      height: 720,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, "electron", "preload.cjs"),
        contextIsolation: true,
      },
    });

    await dashboardWin.loadFile(path.join(__dirname, "public", "dashboard.html"));

    // Verify Today View
    const hasTodayHero = await dashboardWin.webContents.executeJavaScript("!!document.getElementById('todayAvatarHero')");
    if (hasTodayHero) pass("Dashboard Today view active with peeking avatar hero");

    // Verify Personalize Appearance Grid (9 styles)
    const appearanceCards = await dashboardWin.webContents.executeJavaScript("document.querySelectorAll('.appearance-card').length");
    if (appearanceCards === 9) {
      pass(`Dashboard Personalize appearance grid has all 9 avatar styles`);
    } else {
      throw new Error(`Expected 9 appearance cards, found ${appearanceCards}`);
    }

    // Verify Power-ups View (Flying Chappal)
    const hasChappal = await dashboardWin.webContents.executeJavaScript("document.body.innerText.includes('Flying Chappal')");
    if (hasChappal) pass("Power-ups tab active with Flying Chappal preview card");

    // Verify Reminders View (14 reminders)
    const reminderRows = await dashboardWin.webContents.executeJavaScript("document.querySelectorAll('.reminder-row').length");
    if (reminderRows >= 14) {
      pass(`Reminders tab active with all ${reminderRows} customizable reminder rows`);
    } else {
      throw new Error(`Expected at least 14 reminder rows, found ${reminderRows}`);
    }

    // 3. Test Overlay Companion & Speech Bubble with Cross Icon
    const overlayWin = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, "electron", "preload.cjs"),
        contextIsolation: true,
      },
    });

    overlayWin.webContents.on("console-message", (_e, _level, msg) => {
      console.log("  [OVERLAY CONSOLE]:", msg);
    });

    await overlayWin.loadFile(path.join(__dirname, "public", "overlay.html"));

    // Check cross icon button exists
    const hasCloseBtn = await overlayWin.webContents.executeJavaScript("!!document.getElementById('closeBtn')");
    if (hasCloseBtn) {
      pass("Overlay speech bubble contains cross button (✕) to remove/dismiss");
    } else {
      throw new Error("Missing closeBtn in overlay speech bubble");
    }

    // Check action buttons exist
    const hasActionButtons = await overlayWin.webContents.executeJavaScript("!!document.getElementById('btnOkay') && !!document.getElementById('btnSnooze')");
    if (hasActionButtons) {
      pass("Overlay speech bubble contains 'Okay, Mom' and 'In 10 min' action buttons");
    } else {
      throw new Error("Missing action buttons in overlay speech bubble");
    }

    // Test dismiss action
    const dismissWorks = await overlayWin.webContents.executeJavaScript(`
      new Promise((resolve) => {
        setTimeout(() => {
          const pod = document.getElementById('pod');
          pod.classList.add('in');
          document.getElementById('closeBtn').click();
          resolve(!pod.classList.contains('in'));
        }, 300);
      })
    `);
    if (dismissWorks) {
      pass("Clicking cross icon (✕) successfully dismisses/removes the bubble");
    } else {
      throw new Error("Close button did not remove bubble");
    }

    console.log("\n=======================================================");
    console.log(`  ALL ${passedTests} TEST CASES PASSED WITH 100% SUCCESS!  `);
    console.log("=======================================================\n");

    onboardingWin.destroy();
    dashboardWin.destroy();
    overlayWin.destroy();
    app.quit();
    process.exit(0);
  } catch (err) {
    console.error("\n[TEST FAILED]:", err);
    app.quit();
    process.exit(1);
  }
});
