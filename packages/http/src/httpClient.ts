import type { AxiosInstance, AxiosRequestConfig } from "axios";
import axios from "axios";
import { getApiUrl } from "@erp-digital-printing/libs";
import type { TokenGetter, TokenSetter } from "./interceptors/request";
import {
  createRequestInterceptor,
  requestErrorInterceptor,
} from "./interceptors/request";
import {
  createResponseErrorInterceptor,
  responseInterceptor,
} from "./interceptors/response";

export interface HttpClientConfig extends AxiosRequestConfig {
  getToken?: TokenGetter;
  onTokenRefreshed?: TokenSetter;
  onAuthFailure?: () => void | Promise<void>;
}

export class HttpClient {
  private instance: AxiosInstance;
  private getToken?: TokenGetter;
  private onTokenRefreshed?: TokenSetter;
  private onAuthFailure?: () => void | Promise<void>;

  constructor(config?: HttpClientConfig) {
    const { getToken, onTokenRefreshed, onAuthFailure, ...axiosConfig } =
      config || {};
    this.getToken = getToken;
    this.onTokenRefreshed = onTokenRefreshed;
    this.onAuthFailure = onAuthFailure;

    this.instance = axios.create({
      baseURL: getApiUrl(),
      timeout: 30000,
      withCredentials: true, // Penting untuk mengirim cookie (refresh_token)
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      ...axiosConfig,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request Interceptor
    this.instance.interceptors.request.use(
      createRequestInterceptor(this.getToken),
      requestErrorInterceptor,
    );

    // Response Interceptor
    this.instance.interceptors.response.use(
      responseInterceptor,
      createResponseErrorInterceptor(
        this.instance,
        this.onTokenRefreshed,
        this.onAuthFailure,
      ),
    );
  }

  public async get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  public async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  public async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  public async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  public async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  // Helper untuk mendapatkan instance aslinya jika dibutuhkan
  public getInstance(): AxiosInstance {
    return this.instance;
  }
}

// Singleton instance untuk penggunaan umum
export const httpClient = new HttpClient();
