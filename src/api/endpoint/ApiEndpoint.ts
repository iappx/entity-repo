import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

export abstract class ApiEndpoint {
    protected service: AxiosInstance

    constructor(config: AxiosRequestConfig) {
        this.service = axios.create(config)

        this.service.interceptors.response.use(
            response => {
                return response.data
            },
            error => {
                return Promise.reject(error)
            },
        )
    }

    protected getReq<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.sendHandler(() => this.service.get(url, config))
    }

    protected postReq<T>(url: string, data?: Record<string, any>, config?: AxiosRequestConfig): Promise<T> {
        return this.sendHandler(() => this.service.post(url, data, config))
    }

    protected putReq<T>(url: string, data?: Record<string, any>, config?: AxiosRequestConfig): Promise<T> {
        return this.sendHandler(() => this.service.put(url, data, config))
    }

    protected deleteReq<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.sendHandler(() => this.service.delete(url, config))
    }

    protected sendHandler<T>(handler: () => Promise<T>): Promise<T> {
        return handler()
    }
}