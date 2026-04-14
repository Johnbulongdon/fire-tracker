const fs = require('fs');
const { execSync } = require('child_process');

try {
  // 1. Fix tsconfig.json
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  tsconfig.exclude = ["node_modules"]; // Remove "src" from exclude
  fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));
  console.log('Fixed tsconfig.json');

  // 2. Remove Vite artifacts
  const filesToRemove = ['index.html', 'vite.config.ts', 'tsconfig.node.json'];
  filesToRemove.forEach(f => {
    if (fs.existsSync(f)) {
      fs.unlinkSync(f);
      console.log(`Removed ${f}`);
    }
  });

  // 3. Run Build
  console.log('Starting build...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build successful!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
