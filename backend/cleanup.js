const fs = require('fs');
const path = require('path');

const backendDir = 'C:\\Users\\USER\\Desktop\\Smart-Campus\\backend';

const filesToRemove = [
    'Dockerfile',
    'docker-compose.yml',
    'compose-up.ps1',
    'github-workflow.yml',
    'mvnw',
    'mvnw.cmd',
    '.env.example',
    '.gitattributes'
];

const dirsToRemove = ['.mvn', 'target'];

console.log('🗑️  Starting cleanup...\n');

// Remove files
filesToRemove.forEach(file => {
    const filePath = path.join(backendDir, file);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Removed: ${file}`);
    } else {
        console.log(`⏭️  Not found: ${file}`);
    }
});

// Remove directories
dirsToRemove.forEach(dir => {
    const dirPath = path.join(backendDir, dir);
    if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`✅ Removed folder: ${dir}`);
    } else {
        console.log(`⏭️  Not found: ${dir}`);
    }
});

console.log('\n🎉 Cleanup complete!\n');
console.log('📁 Remaining files:');
fs.readdirSync(backendDir).filter(item => {
    return fs.statSync(path.join(backendDir, item)).isFile();
}).sort().forEach(file => {
    console.log(`   - ${file}`);
});
