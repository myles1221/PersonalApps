# Finance Tracker

A **local-only** personal finance tracker that runs on your phone or computer. No account, no server—data stays in your device.

## Features

- **Dashboard on open**: Totals, bar chart (by category), pie chart, and line chart (over time)
- **Upload CSV**: Export transactions from your bank/credit card as CSV and upload
- **Paste statements**: Copy text from a PDF or email statement and paste to import
- **Auto-categories**: Expenses are categorized by merchant/description (Groceries, Food & Dining, Transport, Shopping, Bills, Entertainment, Health, Other). Edit `src/categorize.js` to add your own keywords
- **Recent expenses**: List shows last 25 by default; tap “Show all” to expand to last 1,000
- **Account labels**: Name each source (e.g. “Chase Credit”, “Debit”) when uploading so you can tell them apart

## Running locally

```bash
cd finance-tracker
npm install
npm run dev
```

Open the URL shown (e.g. `http://localhost:5173`).

---

## No Mac? Use the app on your iPhone anyway

You can still get the app on your iPhone home screen and use it like a normal app. Your data stays on your phone (IndexedDB). Pick one:

### Option A: From your Windows PC (same Wi‑Fi)

Good when you’re at home and your PC is on.

1. On your PC, in the project folder, build and serve the app:
   ```bash
   npm run build
   npx serve dist
   ```
   (If you don’t have `serve`: `npm install -g serve` or use `npx serve dist`.)
2. Note the URL (e.g. `http://localhost:3000`). Find your PC’s IP: open Command Prompt and run `ipconfig`, look for “IPv4 Address” under your Wi‑Fi adapter (e.g. `192.168.1.5`).
3. On your iPhone, connect to the **same Wi‑Fi**. Open **Safari** and go to `http://YOUR_PC_IP:3000` (e.g. `http://192.168.1.5:3000`).
4. When the app loads, tap the **Share** button (square with arrow) → **Add to Home Screen** → **Add**.
5. Open **Finance Tracker** from your home screen. It runs full screen and stores everything on your phone.

The app only loads when your PC is on and your iPhone is on the same network. To use it elsewhere, use Option B.

### Option B: Put it online (free) – use it anywhere

Deploy the built app to a free host so you get a URL. You open that URL once in Safari, add to home screen, and after that the app works from your phone like normal; the URL is only used to load the app files. **Your transaction data still stays only on your phone** (nothing is sent to the host).

1. Build the app: `npm run build`
2. Deploy the **`dist`** folder to one of these (all have free tiers):
   - **[Vercel](https://vercel.com)** – Sign up (free), drag and drop the `dist` folder onto [vercel.com/new](https://vercel.com/new), or connect your GitHub repo and set “Output Directory” to `dist`.
   - **[Netlify](https://netlify.com)** – Sign up (free), drag and drop the `dist` folder at [app.netlify.com/drop](https://app.netlify.com/drop).
   - **[GitHub Pages](https://pages.github.com)** – Push the project to a GitHub repo, enable Pages, set source to the branch and folder that contains the built files (e.g. `dist` or a `docs` folder you copy `dist` into).
3. You’ll get a URL like `https://finance-tracker-xxx.vercel.app`.
4. On your iPhone, open **Safari**, go to that URL, then **Share** → **Add to Home Screen** → **Add**.
5. Open **Finance Tracker** from your home screen; it works anywhere and your data stays on the device.

---

## Getting the project onto your Mac

The app is built on your Windows PC; to install it on your iPhone you need the same files on a Mac. Pick one:

- **USB drive** – Copy the whole `finance-tracker` folder onto a USB stick, plug it into your Mac, then copy the folder to your Mac (e.g. Desktop or Documents).
- **Cloud folder** – Put `finance-tracker` in OneDrive, Google Drive, Dropbox, or iCloud and open that folder on your Mac (or sync and use the copy on the Mac).
- **Git** – If you use Git: create a repo (e.g. on GitHub), push from Windows, then on the Mac run `git clone <repo-url>` and `cd finance-tracker`.
- **Zip + transfer** – Zip the `finance-tracker` folder (right‑click → Send to → Compressed folder), email it to yourself or upload to Google Drive/OneDrive, download on the Mac, then double‑click the zip to unzip.

On the Mac, open Terminal, `cd` into the project folder, then run the steps in “Install on iPhone via USB” below (e.g. `npm install`, `npx cap add ios`, etc.).

---

## Install on iPhone via USB (Mac required)

To put the app on your home screen and install it over a USB cable (e.g. USB-A to Lightning, or USB-A to USB-C for newer iPhones), you need a **Mac with Xcode**. The app is built as a native iOS app (Capacitor) and installed from Xcode to your device.

**One-time setup (on your Mac):**

1. Install [Xcode](https://apps.apple.com/app/xcode/id497799835) from the App Store (free).
2. In the project folder, install dependencies and add the iOS app:
   ```bash
   cd finance-tracker
   npm install
   npx cap add ios
   ```
3. Build the web app and copy it into the iOS project:
   ```bash
   npm run cap:sync
   ```
4. Open the project in Xcode:
   ```bash
   npm run cap:ios
   ```
5. In Xcode: connect your iPhone with your USB cable (e.g. USB-A to Lightning), unlock the phone, and if prompted tap “Trust” on the device. In the toolbar, choose your **iPhone** as the run target (not “Simulator”), then click **Run** (▶).
6. First time only: on the iPhone, go to **Settings → General → VPN & Device Management**, tap your Apple ID under “Developer App”, and tap **Trust**.
7. The app installs and appears on your home screen. You can disconnect the cable; it stays installed like any other app.

**After you change the app (e.g. new features):**

```bash
npm run cap:sync
```

Then in Xcode, click **Run** again with the phone connected to install the update.

## CSV format

Your CSV should have columns that look like **Date**, **Amount** (or Debit/Transaction), and **Description** (or Merchant/Memo). Headers are auto-detected. Example:

```csv
Date,Amount,Description
2025-02-01,42.50,AMAZON
2025-02-02,15.00,COFFEE SHOP
```

## Data and privacy

- All data is stored only in your browser (IndexedDB). Nothing is sent to any server.
- No login or account required.
