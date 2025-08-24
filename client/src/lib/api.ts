import axios from "axios";
import { v4 as uuid } from "uuid";

export const BASE_URL = "http://localhost:5000/api"

axios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    // handle the error
    return Promise.reject(error?.response || error);
  }
);

export const getAccessToken = () => {
  if (typeof window === "undefined") {
    return;
  }

  return localStorage.getItem("TOKEN") || localStorage.getItem("token");
};

const getInstance = ({ headers: _headers = {} }: { headers?: any }) => {
  let randomId =
    localStorage.getItem("uuid") ?? localStorage.getItem("randomId");
  if (randomId === null) {
    randomId = uuid();
    localStorage.setItem("randomId", randomId);
  }

  const headers: any = {
    ...{
      "Content-Type": "application/json",
      version: "0.0.1",
      "client-id": process.env.NEXT_PUBLIC_CLIENT_ID,
      "client-version": process.env.NEXT_PUBLIC_CLIENT_VERSION,
      "client-type": process.env.NEXT_PUBLIC_CLIENT_TYPE,
      randomId: localStorage.getItem("uuid") ?? randomId,
    },
    ..._headers,
  };

  const tokenContext = getAccessToken() ? { token: getAccessToken() } : null;
  if (tokenContext) {
    headers["Authorization"] = `Bearer ${tokenContext.token}`;
  }
  if (typeof window !== "undefined") {
    headers["randomId"] =
      localStorage.getItem("uuid") ?? localStorage.getItem("randomId");
  }

  const Instance = axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
    headers: headers,
  });

  Instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Handle 401 errors by redirecting to login
      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("TOKEN");
        localStorage.removeItem("user");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      // handle the error
      return Promise.reject(
        error?.response?.data?.error || error?.response || error?.message
      );
    }
  );
  return Instance;
};

interface Config {
  params?: any;
  headers?: any;
}

export const Client: any = {
  get: (endpoint: string, config: Config = {}) => {
    let params: any = [];
    if (config.params) {
      for (let p in config.params) {
        let key = p;
        if (Array.isArray(config.params[p])) {
          config.params[p].forEach((element: any) => {
            params.push(`${key}=${encodeURIComponent(element)}`);
          });
        } else {
          params.push(`${key}=${encodeURIComponent(config.params[p])}`);
        }
      }
    }
    const Instance = getInstance({ headers: config.headers || {} });
    return Instance(endpoint, {
      params: config.params || {},
    });
  },
  post: (endpoint: string, data: any, config: Config = {}) => {
    let params: any = [];
    if (config.params) {
      for (let p in config.params) {
        let key = p;
        if (Array.isArray(config.params[p])) {
          config.params[p].forEach((element: any) => {
            params.push(`${key}=${encodeURIComponent(element)}`);
          });
        } else {
          params.push(`${key}=${encodeURIComponent(config.params[p])}`);
        }
      }
    }
    if (config.params) {
      return Client.get(endpoint + "?" + params.join("&"), {
        ...config,
        method: "GET",
      });
    }
    const Instance = getInstance({ headers: config.headers || {} });
    return Instance.post(endpoint, data, {
      params: config.params || {},
    });
  },
  delete: (endpoint: string, data: any, config: Config = {}) => {
    let params: any = [];
    if (config.params) {
      for (let p in config.params) {
        let key = p;
        if (Array.isArray(config.params[p])) {
          config.params[p].forEach((element: any) => {
            params.push(`${key}=${encodeURIComponent(element)}`);
          });
        } else {
          params.push(`${key}=${encodeURIComponent(config.params[p])}`);
        }
      }
    }
    if (config.params) {
      return Client.get(endpoint + "?" + params.join("&"), {
        ...config,
        method: "DELETE",
      });
    }
    const Instance = getInstance({ headers: config.headers || {} });
    return Instance.delete(endpoint, data);
  },

  put: (endpoint: string, data: any, config: Config = {}) => {
    let params: any = [];
    if (config.params) {
      for (let p in config.params) {
        let key = p;
        if (Array.isArray(config.params[p])) {
          config.params[p].forEach((element: any) => {
            params.push(`${key}=${encodeURIComponent(element)}`);
          });
        } else {
          params.push(`${key}=${encodeURIComponent(config.params[p])}`);
        }
      }
    }
    if (config.params) {
      return Client.get(endpoint + "?" + params.join("&"), {
        ...config,
        method: "PUT",
      });
    }
    const Instance = getInstance({ headers: config.headers || {} });
    return Instance.put(endpoint, data);
  },
};

export default Client;
