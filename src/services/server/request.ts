import axios from 'axios';

const request = axios.create({
  baseURL: '/server-api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default request;
