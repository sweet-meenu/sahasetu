const fs = require('fs');
const path = require('path');

const targetDirectories = [
  'app',
  'components',
  'contexts',
  'docker',
  'lib',
  'messages',
  'public',
  'scripts',
];

const targetFiles = [
  'middleware.ts',
  'docker-compose.yml',
  'docker-compose.dev.yml',
  'next.config.ts',
];

// Specific replacement rules
const replacements = [
  // 1. Core cases
  { search: /SaahasSetu/g, replace: 'SaahasSetu' },
  { search: /sahasetu/g, replace: 'sahasetu' },
  { search: /SAAHASSETU/g, replace: 'SAAHASSETU' },

  // 2. Language transliterations
  // Hindi & Marathi
  { search: /साहससेतु/g, replace: 'साहससेतु' },
  // Bengali
  { search: /সাহসসেতু/g, replace: 'সাহসসেতু' },
  // Telugu
  { search: /సాహససేతు/g, replace: 'సాహససేతు' },
  
  // Tamil (including proper inflected variants for natural reading)
  { search: /சாஹஸ்சேதுவைத்/g, replace: 'சாஹஸ்சேதுவைத்' }, // Accusative case
  { search: /சாஹஸ்சேது/g, replace: 'சாஹஸ்சேது' }, // Direct
];

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      // Skip next, node_modules, and git directories
      if (!['.next', 'node_modules', '.git'].includes(file)) {
        getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

async function renameBrand() {
  console.log('🚀 Starting SaahasSetu rebranding refactor...');
  
  const filesToProcess = [];

  // Add individual files
  targetFiles.forEach((file) => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      filesToProcess.push(filePath);
    }
  });

  // Add directory files
  targetDirectories.forEach((dir) => {
    const dirPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(dirPath)) {
      getAllFiles(dirPath, filesToProcess);
    }
  });

  let modifiedCount = 0;

  filesToProcess.forEach((filePath) => {
    // Skip binary files (images, zip, etc.)
    const ext = path.extname(filePath);
    if (['.png', '.jpg', '.jpeg', '.gif', '.ico', '.enc'].includes(ext)) {
      return;
    }

    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      let updatedContent = originalContent;

      replacements.forEach((rule) => {
        updatedContent = updatedContent.replace(rule.search, rule.replace);
      });

      if (originalContent !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`✔ Rebranded: ${path.relative(path.join(__dirname, '..'), filePath)}`);
        modifiedCount++;
      }
    } catch (err) {
      console.error(`❌ Error processing ${filePath}:`, err.message);
    }
  });

  console.log(`\n🎉 Rebranding complete! Modified ${modifiedCount} files.`);
}

renameBrand();
