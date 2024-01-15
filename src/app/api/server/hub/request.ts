import axios from 'axios';

const request = axios.create({
  baseURL: process.env.PLAYGROUND_SERVER_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default request;
