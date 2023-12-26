const args = process.argv.slice(2);

let hostname = '0.0.0.0'; // Default hostname
let currentPort = 3000; // Default port
let serverUrl = 'http://127.0.0.1:8000'; // Default server URL

// Parsing command line arguments
args.forEach((arg) => {
  const [key, value] = arg.split('=');
  switch (key) {
    case '--host':
      hostname = value;
      break;
    case '--port':
      currentPort = value;
      break;
    case '--server':
      serverUrl = value;
      break;
  }
});

// Setting environment variables
process.env.HOSTNAME = hostname;
process.env.PORT = currentPort;
process.env.PLAYGROUND_SERVER_BASE_URL = serverUrl;

// Log current status
console.log(`Environment settings:\n - Hostname: ${hostname}\n - Port: ${currentPort}\n - Server URL: ${serverUrl}\n\n`);

const { spawn } = require('child_process');
const server = spawn('node', ['server.js'], { stdio: 'inherit' });

server.on('close', (code) => {
  console.log(`server.js process exited with exit code ${code}`);
});
