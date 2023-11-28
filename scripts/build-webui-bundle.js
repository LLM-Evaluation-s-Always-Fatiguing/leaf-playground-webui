const { execSync } = require('child_process');
const fs = require('fs-extra');
const packageJson = require('../package.json');
const archiver = require('archiver');

/**
 * Bundle WebUI.
 * Steps include:
 * 1. Creating a new bundle directory.
 * 2. Copying .next/standalone to the bundle directory and renaming it to webui.
 * 3. Copying the public directory and .next/static to their respective locations in the bundle.
 */
function bundleWebUI() {
  try {
    fs.ensureDirSync('./bundle'); // Ensure the bundle directory exists
    fs.copySync('./.next/standalone', './bundle/webui'); // Copy and rename standalone directory
    fs.copySync('./public', './bundle/webui/public'); // Copy public directory
    fs.copySync('./.next/static', './bundle/webui/.next/static'); // Copy static directory

    console.log('WebUI bundled successfully');
  } catch (error) {
    console.error('Error while bundling Web UI:', error);
    throw error;
  }
}

function installDependenciesAndBuild() {
  try {
    console.log('Installing dependencies...');
    execSync('pnpm install', { stdio: 'inherit' });

    console.log('Building project...');
    execSync('pnpm build', { stdio: 'inherit' });

    bundleWebUI();
    console.log('Project build and bundling completed successfully.');
  } catch (error) {
    console.error('Error during installation or build:', error);
    throw error;
  }
}

function zipBundle() {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(`./bundle/webui-v${packageJson.version}.zip`);
    archive
      .directory('./bundle/webui', false)
      .on('error', (err) => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize();
  });
}

async function main() {
  fs.removeSync('./bundle'); // Delete old bundle directory

  try {
    const pnpmVersion = execSync('pnpm --version', { encoding: 'utf-8' }).trim();
    console.log(`pnpm is installed, version: ${pnpmVersion}`);
    installDependenciesAndBuild();
  } catch (pnpmError) {
    console.log('pnpm is not installed. Enabling corepack...');
    try {
      execSync('corepack enable', { stdio: 'inherit' });
      console.log('Corepack enabled successfully. Installing pnpm...');

      installDependenciesAndBuild();
    } catch (enableError) {
      console.error('Error enabling corepack:', enableError);
      throw error;
    }
  }

  try {
    console.log('Starting Zip Bundle...');
    await zipBundle();
    console.log('Zip Bundle completed successfully.');
  } catch (e) {
    console.error('Zip Bundle failed:', e);
    throw error;
  }
}

main(); // Start the script execution
