import { logger } from './Logger';

interface RequestLog {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: string;
}

interface ResponseLog {
  requestId: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body?: any;
  duration: number;
  timestamp: string;
}

class NetworkInterceptorService {
  private requests = new Map<string, RequestLog>();
  private responses: ResponseLog[] = [];
  private maxEntries = 100;

  init() {
    this.interceptFetch();
    this.interceptXMLHttpRequest();
    logger.info('NETWORK', 'Network interceptor initialized');
  }

  private interceptFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const requestId = crypto.randomUUID();
      const startTime = performance.now();
      
      // Log request
      const url = input instanceof Request ? input.url : input.toString();
      const method = init?.method || (input instanceof Request ? input.method : 'GET');
      
      const requestLog: RequestLog = {
        id: requestId,
        url,
        method,
        headers: this.getHeaders(init?.headers || {}),
        body: init?.body ? await this.cloneBody(init.body) : undefined,
        timestamp: new Date().toISOString()
      };
      
      this.requests.set(requestId, requestLog);
      
      logger.apiDebug(`${method} ${url}`, {
        requestId,
        headers: requestLog.headers,
        body: requestLog.body
      });

      try {
        const response = await originalFetch(input, init);
        const duration = performance.now() - startTime;
        
        // Clone response to read body without consuming it
        const responseClone = response.clone();
        let responseBody: any;
        
        try {
          const text = await responseClone.text();
          responseBody = text ? JSON.parse(text) : null;
        } catch (e) {
          responseBody = 'Unable to parse response body';
        }
        
        // Log response
        const responseLog: ResponseLog = {
          requestId,
          status: response.status,
          statusText: response.statusText,
          headers: this.getResponseHeaders(response.headers),
          body: responseBody,
          duration,
          timestamp: new Date().toISOString()
        };
        
        this.responses.unshift(responseLog);
        if (this.responses.length > this.maxEntries) {
          this.responses = this.responses.slice(0, this.maxEntries);
        }
        
        if (response.ok) {
          logger.apiInfo(`${method} ${url} - ${response.status}`, {
            requestId,
            status: response.status,
            duration: `${duration.toFixed(2)}ms`,
            responseHeaders: responseLog.headers
          });
        } else {
          logger.apiError(`${method} ${url} - ${response.status} ${response.statusText}`, undefined, {
            requestId,
            status: response.status,
            statusText: response.statusText,
            duration: `${duration.toFixed(2)}ms`,
            responseBody: responseLog.body,
            requestBody: requestLog.body
          });
        }
        
        return response;
        
      } catch (error) {
        const duration = performance.now() - startTime;
        
        logger.apiError(`${method} ${url} - Network Error`, error as Error, {
          requestId,
          duration: `${duration.toFixed(2)}ms`,
          requestBody: requestLog.body
        });
        
        throw error;
      }
    };
  }

  private interceptXMLHttpRequest() {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
      (this as any)._method = method;
      (this as any)._url = url.toString();
      (this as any)._requestId = crypto.randomUUID();
      (this as any)._startTime = performance.now();
      
      return originalOpen.apply(this, [method, url, ...args]);
    };
    
    XMLHttpRequest.prototype.send = function(body?: Document | XMLHttpRequestBodyInit | null) {
      const requestId = (this as any)._requestId;
      const method = (this as any)._method;
      const url = (this as any)._url;
      const startTime = (this as any)._startTime;
      
      logger.apiDebug(`XHR ${method} ${url}`, {
        requestId,
        body: body ? body.toString() : undefined
      });
      
      this.addEventListener('load', () => {
        const duration = performance.now() - startTime;
        
        if (this.status >= 200 && this.status < 300) {
          logger.apiInfo(`XHR ${method} ${url} - ${this.status}`, {
            requestId,
            status: this.status,
            duration: `${duration.toFixed(2)}ms`,
            response: this.responseText
          });
        } else {
          logger.apiError(`XHR ${method} ${url} - ${this.status} ${this.statusText}`, undefined, {
            requestId,
            status: this.status,
            statusText: this.statusText,
            duration: `${duration.toFixed(2)}ms`,
            response: this.responseText
          });
        }
      });
      
      this.addEventListener('error', () => {
        const duration = performance.now() - startTime;
        
        logger.apiError(`XHR ${method} ${url} - Network Error`, undefined, {
          requestId,
          duration: `${duration.toFixed(2)}ms`
        });
      });
      
      return originalSend.apply(this, [body]);
    };
  }

  private getHeaders(headers: HeadersInit): Record<string, string> {
    const result: Record<string, string> = {};
    
    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        result[key] = value;
      });
    } else if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => {
        result[key] = value;
      });
    } else if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        result[key] = value;
      });
    }
    
    return result;
  }

  private getResponseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private async cloneBody(body: BodyInit): Promise<any> {
    if (typeof body === 'string') {
      return body;
    }
    if (body instanceof FormData) {
      return 'FormData';
    }
    if (body instanceof URLSearchParams) {
      return body.toString();
    }
    if (body instanceof ArrayBuffer) {
      return 'ArrayBuffer';
    }
    if (body instanceof Blob) {
      return await body.text();
    }
    return body;
  }

  getNetworkLogs() {
    return {
      requests: Array.from(this.requests.values()),
      responses: this.responses
    };
  }

  clearNetworkLogs() {
    this.requests.clear();
    this.responses = [];
    logger.info('NETWORK', 'Network logs cleared');
  }
}

export const networkInterceptor = new NetworkInterceptorService();