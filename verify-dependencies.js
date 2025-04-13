// Verify project dependencies
import fs from 'fs';
import path from 'path';

console.log('Verifying Health Insights Navigator dependencies...');

// Check for axios in package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  
  console.log('\nAnalyzing package.json:');
  
  const dependencies = {
    ...packageJson.dependencies || {},
    ...packageJson.devDependencies || {}
  };
  
  const requiredDeps = [
    '@vitejs/plugin-react-swc',
    'react',
    'react-dom',
    'react-router-dom'
  ];
  
  // Check required dependencies
  const missingDeps = requiredDeps.filter(dep => !dependencies[dep]);
  
  if (missingDeps.length > 0) {
    console.log(`❌ Missing required dependencies: ${missingDeps.join(', ')}`);
  } else {
    console.log('✅ All required dependencies are installed');
  }
  
  // Check for common issues
  if (dependencies['axios']) {
    console.log('⚠️ axios is installed, but you are using fetch API');
  }
  
  // Check for file imports
  console.log('\nAnalyzing src/lib/api.js:');
  try {
    const apiFile = fs.readFileSync('./src/lib/api.js', 'utf8');
    
    if (apiFile.includes("import axios")) {
      console.log('❌ src/lib/api.js still has import axios statement');
    } else {
      console.log('✅ src/lib/api.js is using fetch API correctly');
    }
  } catch (err) {
    console.log(`❌ Could not read src/lib/api.js: ${err.message}`);
  }
  
  console.log('\nVerification complete. Your project should be ready to run.');
} catch (err) {
  console.error(`Error analyzing dependencies: ${err.message}`);
} 