import axios from 'axios';

const request = axios.create({
  baseURL:
    typeof window === 'undefined' ? process.env.PLAYGROUND_SERVER_BASE_URL || 'http://127.0.0.1:8000' : '/api/server',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default request;
