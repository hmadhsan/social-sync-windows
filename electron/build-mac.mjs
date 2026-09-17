import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(rootDir, "..");

const SEVEN_ZIP = "C:\\Users\\PC01\\AppData\\Local\\electron-builder\\Cache\\7zip@1.0.0\\7zip-win-x64-a34pt\\bin\\7za.exe";
const ELECTRON_VERSION = "44.4.1";
const ARCH = "arm64";
const CACHED_ZIP = path.join(workspaceRoot, "electron-darwin-arm64.zip");
const DOWNLOAD_URL = `https://github.com/electron/electron/releases/download/v${ELECTRON_VERSION}/electron-v${ELECTRON_VERSION}-darwin-${ARCH}.zip`;

const stagingDir = path.join(workspaceRoot, "pack-staging");
const tempInject = path.join(workspaceRoot, "temp_inject");
const tempPlist = path.join(workspaceRoot, "temp_plist");
const publicZip = path.join(rootDir, "public", "Ammi-mac.zip");
const rootZip = path.join(workspaceRoot, "Ammi-mac.zip");

console.log("\n===> Building Ammi for macOS (Apple Silicon & Intel)...");

// [1/5] Prepare app files in pack-staging
console.log("📦 [1/5] Staging app assets...");
if (fs.existsSync(stagingDir)) fs.rmSync(stagingDir, { recursive: true, force: true });
fs.mkdirSync(stagingDir, { recursive: true });

fs.cpSync(path.join(rootDir, "build"), path.join(stagingDir, "build"), { recursive: true });
fs.cpSync(path.join(rootDir, "electron"), path.join(stagingDir, "electron"), { recursive: true });
fs.cpSync(path.join(rootDir, "public"), path.join(stagingDir, "public"), {
  recursive: true,
  filter: (src) => !src.endsWith(".exe") && !src.endsWith(".zip"),
});

const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"));
const appPkg = {
  name: pkg.name || "ammi",
  productName: "Ammi",
  version: pkg.version || "1.0.1",
  main: "electron/main.cjs",
  description: pkg.description || "Ammi — someone's looking out for you",
};
fs.writeFileSync(path.join(stagingDir, "package.json"), JSON.stringify(appPkg, null, 2));

// [2/5] Package app.asar
console.log("📦 [2/5] Packaging app.asar...");
const asarOut = path.join(workspaceRoot, "app.asar");
execSync(`npx -y @electron/asar pack "${stagingDir}" "${asarOut}"`, { stdio: "inherit" });

// [3/5] Verify Electron runtime zip
console.log("📦 [3/5] Checking macOS Electron runtime...");
if (!fs.existsSync(CACHED_ZIP) || fs.statSync(CACHED_ZIP).size < 100000000) {
  console.log(`Downloading ${DOWNLOAD_URL}...`);
  execSync(`curl.exe -L "${DOWNLOAD_URL}" -o "${CACHED_ZIP}"`, { stdio: "inherit" });
}

// [4/5] Configure Ammi.app inside zip without breaking symlinks
console.log("📦 [4/5] Assembling Ammi.app inside zip...");
if (fs.existsSync(rootZip)) fs.unlinkSync(rootZip);
fs.copyFileSync(CACHED_ZIP, rootZip);

if (fs.existsSync(tempPlist)) fs.rmSync(tempPlist, { recursive: true, force: true });
fs.mkdirSync(tempPlist, { recursive: true });

// Extract and edit Info.plist
execSync(`"${SEVEN_ZIP}" e "${rootZip}" "Electron.app/Contents/Info.plist" -o"${tempPlist}" -y`, { stdio: "inherit" });

const plistPath = path.join(tempPlist, "Info.plist");
let plist = fs.readFileSync(plistPath, "utf8");
plist = plist.replace(/<string>Electron<\/string>/g, "<string>Ammi</string>");
plist = plist.replace(/<string>com\.github\.Electron<\/string>/g, "<string>app.ammi.desktop<\/string>");
plist = plist.replace(/<string>electron<\/string>/g, "<string>ammi<\/string>");
fs.writeFileSync(plistPath, plist, "utf8");

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

// Delete default_app.asar and unedited Info.plist from zip
sleep(1200);
execSync(`"${SEVEN_ZIP}" d "${rootZip}" "Electron.app/Contents/Resources/default_app.asar" "Electron.app/Contents/Info.plist"`, { stdio: "inherit" });

// Setup temp_inject directory structure
if (fs.existsSync(tempInject)) fs.rmSync(tempInject, { recursive: true, force: true });
const targetRes = path.join(tempInject, "Electron.app", "Contents", "Resources");
const targetContents = path.join(tempInject, "Electron.app", "Contents");
fs.mkdirSync(targetRes, { recursive: true });

fs.copyFileSync(asarOut, path.join(targetRes, "app.asar"));
fs.copyFileSync(plistPath, path.join(targetContents, "Info.plist"));

// Add updated app.asar and Info.plist into zip
sleep(1500);
execSync(`"${SEVEN_ZIP}" a "${rootZip}" "${tempInject}\\*" -r`, { stdio: "inherit" });

// Rename executable and App bundle in one command
sleep(1500);
execSync(`"${SEVEN_ZIP}" rn "${rootZip}" "Electron.app/Contents/MacOS/Electron" "Electron.app/Contents/MacOS/Ammi" "Electron.app" "Ammi.app"`, { stdio: "inherit" });

// Add HOW TO OPEN ON MAC.txt
const readmeMacPath = path.join(workspaceRoot, "HOW TO OPEN ON MAC.txt");
const readmeMac = `Ammi — someone's looking out for you (macOS)
==============================================

1. Drag or unzip Ammi.app into your Applications folder (or Desktop).
2. The first time you open Ammi on macOS:
   Since Ammi is an independent app without a paid Apple certificate,
   macOS Gatekeeper may say "Apple cannot check it for malicious software":
   - Right-click (or Control-click) Ammi.app and select "Open", then click "Open".
   - Or open System Settings > Privacy & Security and click "Open Anyway".
   (You only need to do this once).
3. Ammi lives right in your top menu bar / notch companion.
4. Click her menu bar icon to:
   - Choose language: English, Urdu, German, Punjabi
   - Choose mom energy tone: Gentle, Playful, or Dramatic
   - Set check-in frequency and duration
   - Toggle Start at Login
`;
fs.writeFileSync(readmeMacPath, readmeMac, "utf8");

sleep(2500);
for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    execSync(`"${SEVEN_ZIP}" a "${rootZip}" "${readmeMacPath}"`, { stdio: "inherit" });
    break;
  } catch (err) {
    if (attempt === 3) throw err;
    sleep(2000);
  }
}

// [5/5] Deploy to public/
console.log("📦 [5/5] Deploying Ammi-mac.zip to website public folder...");
if (fs.existsSync(publicZip)) fs.unlinkSync(publicZip);
fs.copyFileSync(rootZip, publicZip);

// Cleanup temporary directories
if (fs.existsSync(tempInject)) fs.rmSync(tempInject, { recursive: true, force: true });
if (fs.existsSync(tempPlist)) fs.rmSync(tempPlist, { recursive: true, force: true });

const sizeMb = (fs.statSync(publicZip).size / 1024 / 1024).toFixed(1);
console.log(`\n🎉 SUCCESS! Ammi macOS package is ready:`);
console.log(`   - Public Web Download: ${publicZip} (${sizeMb} MB)`);
console.log(`   - Root Package:        ${rootZip}`);
