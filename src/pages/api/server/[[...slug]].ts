import { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';

const PLAYGROUND_SERVER_BASE_URL = process.env.PLAYGROUND_SERVER_BASE_URL || 'http://127.0.0.1:8000';

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await httpProxyMiddleware(req, res, {
    target: PLAYGROUND_SERVER_BASE_URL,
    changeOrigin: true,
    pathRewrite: [
      {
        patternStr: '^/api/server',
        replaceStr: '/',
      },
    ],
  });
};

export default handler;
