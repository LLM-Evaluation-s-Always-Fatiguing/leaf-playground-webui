const net = require('net');
const path = require('path');
const { spawn } = require('child_process');

const args = process.argv.slice(2);
let hostname = '0.0.0.0'; // Default hostname
let currentPort = 3000; // Default port
let serverUrl = 'http://127.0.0.1:8000'; // Default server URL
let externalUrl;

// Parsing command line arguments
args.forEach((arg) => {
  const [key, value] = arg.split('=');
  switch (key) {
    case '--host':
      hostname = value;
      break;
    case '--port':
      currentPort = parseInt(value, 10);
      break;
    case '--server':
      serverUrl = value;
      break;
    case '--external_url':
      externalUrl = value;
      break;
  }
});

// Function to check if the port is in use
const checkPort = (port) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(port, hostname);

    server.on('listening', () => {
      server.close();
      resolve(port); // Port is available
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is already in use. Trying port ${port + 1}`);
        resolve(checkPort(port + 1)); // If port is in use, try the next port
      } else {
        reject(err);
      }
    });
  });
};

// Function to start the server
const startServer = async () => {
  console.log(`Starting playground WebUI:`);
  try {
    const port = await checkPort(currentPort); // Wait for a free port
    process.env.HOSTNAME = hostname;
    process.env.PORT = port;
    process.env.PLAYGROUND_SERVER_BASE_URL = serverUrl;
    process.env.WEB_UI_EXTERNAL_URL = externalUrl;

    console.log(`Starting WebUI server at ${hostname}:${port}, serverUrl: ${serverUrl}`);
    const serverProcess = spawn('node', [path.resolve(__dirname, 'server.js')], { stdio: 'inherit' });

    serverProcess.on('close', (code) => {
      console.log(`server.js process exited with exit code ${code}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
  }
};

startServer();
