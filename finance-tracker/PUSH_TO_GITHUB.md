# Push this app to your PersonalApps repo

Run these commands **on your PC** (in PowerShell or Command Prompt). Use the same folder where the Finance Tracker project lives.

## Option A: Add Finance Tracker as a subfolder (recommended)

Your repo will look like: `PersonalApps/README.md` + `PersonalApps/finance-tracker/` (all app files). You can add more apps later.

```powershell
cd C:\Users\myles

git clone https://github.com/myles1221/PersonalApps.git PersonalApps-repo
xcopy finance-tracker PersonalApps-repo\finance-tracker /E /I /H /Y

cd PersonalApps-repo
git add .
git commit -m "Add Finance Tracker app"
git push origin main
```

Then you can delete the `PersonalApps-repo` folder if you like. To update the app later, clone again, copy `finance-tracker` over the old one, then add, commit, push.

---

## Option B: Make the repo only the Finance Tracker (replace current content)

The repo root will be this app (no `finance-tracker` subfolder). The current README in the repo will be replaced by this app’s README.

```powershell
cd C:\Users\myles\finance-tracker

git init
git remote add origin https://github.com/myles1221/PersonalApps.git
git add .
git commit -m "Add Finance Tracker app"
git branch -M main
git push -u origin main --force
```

**Note:** `--force` overwrites the existing repo content. Use only if you’re sure you want the repo to contain only this app.

---

After pushing, your app will be at: **https://github.com/myles1221/PersonalApps**

If you use Option A, the app code is in the `finance-tracker` folder. You can deploy that folder to Vercel/Netlify and set the project (or root) to `finance-tracker` so the site builds from there.
