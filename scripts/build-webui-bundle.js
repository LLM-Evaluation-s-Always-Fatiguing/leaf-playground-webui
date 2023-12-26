const { execSync } = require('child_process');
const fs = require('fs-extra');
const packageJson = require('../package.json');
const archiver = require('archiver');
const crypto = require('crypto');

/**
 * Generate the hash of a file and write it to a new file
 * @param {string} filePath Path of the file
 * @param {string} hashType The hash type to use (e.g., 'sha256', 'md5', etc.)
 */
function generateHashFile(filePath, hashType = 'sha256') {
  return new Promise((resolve, reject) => {
    // Create a hash instance
    const hash = crypto.createHash(hashType);
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => {
      hash.update(data);
    });

    stream.on('end', () => {
      // Compute the hash
      const fileHash = hash.digest('hex');
      // Create path for the hash file
      const hashFilePath = `${filePath}.${hashType}`;

      // Write the hash to a file
      fs.writeFile(hashFilePath, fileHash, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(hashFilePath);
        }
      });
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}

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
    execSync('yarn install', { stdio: 'inherit' });

    console.log('Building project...');
    execSync('yarn build', { stdio: 'inherit' });

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
    const filePath = `./bundle/webui-v${packageJson.version}.zip`;
    const stream = fs.createWriteStream(filePath);
    archive
      .directory('./bundle/webui', false)
      .on('error', (err) => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve(filePath));
    archive.finalize();
  });
}

async function main() {
  fs.removeSync('./bundle'); // Delete old bundle directory

  try {
    const yarnVersion = execSync('yarn --version', { encoding: 'utf-8' }).trim();
    console.log(`yarn is installed, version: ${yarnVersion}`);
    installDependenciesAndBuild();
  } catch (yarnError) {
    console.log('yarn is not installed. Enabling corepack...');
    try {
      execSync('corepack enable', { stdio: 'inherit' });
      console.log('Corepack enabled successfully. Installing yarn...');

      installDependenciesAndBuild();
    } catch (enableError) {
      console.error('Error enabling corepack:', enableError);
      throw error;
    }
  }

  try {
    console.log('Starting Zip Bundle...');
    const filePath = await zipBundle();
    console.log('Zip Bundle completed successfully.');
    console.log(`Bundle file: ${filePath}`);
    console.log('Starting hash generation...');
    await generateHashFile(filePath);
    console.log('Hash generation completed successfully.');

    console.log('All done!');
  } catch (e) {
    console.error('Zip Bundle failed:', e);
    throw error;
  }
}

main(); // Start the script execution
