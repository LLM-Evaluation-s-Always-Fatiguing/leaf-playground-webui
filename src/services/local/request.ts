import axios from 'axios';

const request = axios.create({
  baseURL: typeof window === 'undefined' ? 'http://127.0.0.1:3000/api' : '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default request;
