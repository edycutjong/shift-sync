import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function recordDemo(width, height, outputFolderName) {
  console.log(`\n▶ Starting recording for ${outputFolderName} at ${width}x${height}...`);
  // Launch browser with slowMo so the video isn't too fast
  const browser = await chromium.launch({ headless: false, slowMo: 600 });
  
  const recordDir = path.join(__dirname, 'videos', outputFolderName);
  const context = await browser.newContext({
    recordVideo: { dir: recordDir },
    viewport: { width, height }
  });
  
  const page = await context.newPage();

  try {
    console.log("Navigating to ShiftSync landing page...");
    await page.goto('http://localhost:3000');

    console.log("Clicking 'Try It Now'...");
    await page.waitForTimeout(1000);
    await page.click('text="Try It Now"');
    
    await page.waitForSelector('input[type="file"]');
    await page.waitForTimeout(1000); 
    
    console.log("Uploading test CSV...");
    const fileInput = await page.$('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, 'test-data.csv'));

    console.log("Waiting for AI processing...");
    await page.waitForSelector('text="Approve & Ingest"', { timeout: 35000 });
    
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(2500); 

    console.log("Clicking 'Approve & Ingest'...");
    await page.click('text="Approve & Ingest"');
    
    console.log("Waiting for success screen...");
    await page.waitForSelector('text="Data Ingested!"');
    
    await page.waitForTimeout(3500);
    
    console.log(`✔ Success! Video saved to ${recordDir}`);
  } catch (error) {
    console.error(`Error during ${outputFolderName} demo:`, error);
  } finally {
    await browser.close();
  }
}

(async () => {
  // 1st Run: 1000x800 - Tighter crop, squarer ratio. Perfect for a Github README GIF!
  await recordDemo(1000, 800, 'readme_gif');
  
  // 2nd Run: 1920x1080 - Classic Full HD 16:9 ratio. Perfect for YouTube/Devpost video link!
  await recordDemo(1920, 1080, 'youtube_hd');
  
  console.log("\n🎉 Both recordings complete!");
})();
