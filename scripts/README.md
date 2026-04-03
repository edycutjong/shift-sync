# ShiftSync Demo Script

This folder contains a Playwright script that automatically runs a full demo of ShiftSync and records it to a video file. This is perfect for generating a GIF for your README.

## How to use

1. Go to the `scripts` folder:
   ```bash
   cd scripts
   ```
2. Install Playwright:
   ```bash
   npm init -y
   npm install playwright
   npx playwright install chromium
   ```
3. Make sure your Next.js app is running in another terminal (`npm run dev`).
4. Run the script:
   ```bash
   node demo.mjs
   ```

A browser window will pop up and run the demo automatically. Once it finishes, an `.mp4` video will be saved in the `scripts/videos` folder!
