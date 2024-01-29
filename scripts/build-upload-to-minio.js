const { spawn } = require('child_process');
const Minio = require('minio');
const fs = require('fs').promises;
const packageJson = require('../package.json');
const { version } = packageJson;
const [major, minor, patch] = version.split('.');
const axios = require('axios');

const BUCKET_NAME = 'leaf-playground';
const minioBucketBaseURL = `http://10.88.18.142:32503/leaf-playground/web-ui`;
const versionFilePath = '/releases.json';

const minioClient = new Minio.Client({
  endPoint: '10.88.18.142',
  port: 32503,
  useSSL: false,
  accessKey: 'vddNVcmcRPsmam2ZtGJQ',
  secretKey: 'YTe4AYDuDySMn14aCmWUSSQkJOxbVB547KKYspru',
});

async function uploadFile(bucketName, bucketFilePath, localFilePath) {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      console.log('Bucket does not exist');
      return;
    }

    const fileData = await fs.readFile(localFilePath);
    const info = await minioClient.putObject(bucketName, '/web-ui' + bucketFilePath, fileData);

    console.log('File uploaded successfully. ETag:', info);
  } catch (err) {
    console.log('Error:', err);
  }
}

async function uploadFileContent(bucketName, bucketFilePath, fileContent) {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      console.log('Bucket does not exist');
      return;
    }

    const info = await minioClient.putObject(bucketName, '/web-ui' + bucketFilePath, fileContent);

    console.log('File Content uploaded successfully. ETag:', info);
  } catch (err) {
    console.log('Error:', err);
  }
}

async function executeCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args);

    process.stdout.on('data', (data) => {
      console.log(`${data}`);
    });

    process.stderr.on('data', (data) => {
      console.error(`error: ${data}`);
    });

    process.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`process exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

async function main() {
  try {
    await executeCommand('node', ['./scripts/build-webui-bundle.js']);
    console.log('Load version info from remote');
    const versionInfo = (await axios.get(`${minioBucketBaseURL}${versionFilePath}`)).data;
    if (!versionInfo[major]) {
      versionInfo[major] = {
        [minor]: [],
      };
    } else if (!versionInfo[major][minor]) {
      versionInfo[major][minor] = [];
    }
    console.log('Version info: ', versionInfo);
    console.log('Uploading webui bundle to minio...');
    await uploadFile(
      BUCKET_NAME,
      `/${major}/${minor}/webui-v${packageJson.version}.zip`,
      `./bundle/webui-v${packageJson.version}.zip`
    );
    console.log('Uploading latest webui bundle to minio...');
    await uploadFile(BUCKET_NAME, `/webui-latest.zip`, `./bundle/webui-v${packageJson.version}.zip`);
    console.log('Uploading webui bundle sha256 to minio...');
    await uploadFile(
      BUCKET_NAME,
      `/${major}/${minor}/webui-v${packageJson.version}.zip.sha256`,
      `./bundle/webui-v${packageJson.version}.zip.sha256`
    );
    console.log('Uploading version info to minio...');
    versionInfo[major][minor].push({
      version: `v${packageJson.version}`,
      bundle: `${minioBucketBaseURL}/${major}/${minor}/webui-v${packageJson.version}.zip`,
      sha256: (await fs.readFile(`./bundle/webui-v${packageJson.version}.zip.sha256`)).toString().trim(),
    });
    await uploadFileContent(BUCKET_NAME, versionFilePath, JSON.stringify(versionInfo));
    console.log('Done!');
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

main();
