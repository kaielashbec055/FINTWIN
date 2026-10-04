import axios from 'axios';

export const LOCAL_BASE_URL = "http://localhost:5000";
export const RENDER_BASE_URL = "https://wealth-ai-backend.onrender.com";

/**
 * Executes an HTTP request trying the local development backend first.
 * If local backend times out or is unreachable, falls back to the hosted Render server.
 */
export async function apiRequest(method, endpoint, data = null, config = {}) {
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  try {
    const res = await axios({
      method,
      url: `${LOCAL_BASE_URL}${cleanPath}`,
      data,
      timeout: 2500,
      ...config
    });
    return res;
  } catch (localErr) {
    // If local fails (offline or non-2xx status), fallback to Render
    const res = await axios({
      method,
      url: `${RENDER_BASE_URL}${cleanPath}`,
      data,
      ...config
    });
    return res;
  }
}
