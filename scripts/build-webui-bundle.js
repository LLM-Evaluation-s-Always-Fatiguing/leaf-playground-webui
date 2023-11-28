const { execSync } = require('child_process');
const fs = require('fs-extra');

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
  }
}

function rebuildSharp(platform, arch) {
  const command = `pnpm rebuild --config.platform=${platform} --config.arch=${arch} sharp`;
  console.log(`Executing: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error rebuilding sharp for ${platform}-${arch}:`, error);
    throw error;
  }
}

function installDependenciesAndBuild() {
  try {
    console.log('Installing dependencies...');
    execSync('pnpm install', { stdio: 'inherit' });

    rebuildSharp('linux', 'x64');
    rebuildSharp('win32', 'x64');
    rebuildSharp('darwin', 'x64');
    rebuildSharp('darwin', 'arm64');

    console.log('Building project...');
    execSync('pnpm build', { stdio: 'inherit' });

    bundleWebUI();
    console.log('Project build and bundling completed successfully.');
  } catch (error) {
    console.error('Error during installation or build:', error);
  }
}

function main() {
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
    }
  }
}

main(); // Start the script execution
