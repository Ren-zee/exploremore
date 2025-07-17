// Script to update API URLs in frontend files for deployment
// Run this script before deploying to update localhost URLs to production URLs

const fs = require("fs");
const path = require("path");

// Configuration
const RAILWAY_URL = "https://your-app.railway.app"; // Replace with your actual Railway URL
const PUBLIC_DIR = "./public";

// Files that contain API calls
const jsFiles = [
  "auth.js",
  "budget.js",
  "dashboard.js",
  "dash-feedback.js",
  "dash-price.js",
  "dash-users.js",
  "feedback.js",
  "price.js",
  "promo.js",
  "questions.js",
  "test.js",
];

// Patterns to replace
const patterns = [
  {
    from: /http:\/\/localhost:3001/g,
    to: RAILWAY_URL,
  },
  {
    from: /http:\/\/localhost:3000/g,
    to: RAILWAY_URL,
  },
  {
    from: /'http:\/\/localhost:3001'/g,
    to: `'${RAILWAY_URL}'`,
  },
  {
    from: /"http:\/\/localhost:3001"/g,
    to: `"${RAILWAY_URL}"`,
  },
];

console.log("🔄 Updating API URLs for deployment...");
console.log(`📡 Using Railway URL: ${RAILWAY_URL}`);

let updatedFiles = 0;

jsFiles.forEach((fileName) => {
  const filePath = path.join(PUBLIC_DIR, fileName);

  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, "utf8");
      let hasChanges = false;

      patterns.forEach((pattern) => {
        if (pattern.from.test(content)) {
          content = content.replace(pattern.from, pattern.to);
          hasChanges = true;
        }
      });

      if (hasChanges) {
        fs.writeFileSync(filePath, content, "utf8");
        console.log(`✅ Updated: ${fileName}`);
        updatedFiles++;
      } else {
        console.log(`⏭️  No changes needed: ${fileName}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${fileName}:`, error.message);
    }
  } else {
    console.log(`⚠️  File not found: ${fileName}`);
  }
});

console.log(`\n🎉 Deployment update complete!`);
console.log(`📊 Updated ${updatedFiles} files`);
console.log(`\n🚀 Your app is ready for deployment!`);
console.log(`\nNext steps:`);
console.log(`1. Commit and push your changes to GitHub`);
console.log(`2. Deploy backend to Railway`);
console.log(`3. Deploy frontend to Vercel`);
console.log(`4. Update FRONTEND_URL environment variable in Railway`);
