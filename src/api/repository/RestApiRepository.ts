import { IRepository, PaginatedData } from '../../repositories'
import { Identifier } from '../../types'
import { AxiosRequestConfig } from 'axios'
import { ApiEndpoint } from '../endpoint'
import { RepoEntityBase, RepoEntityStatic } from '../../entity'

export class RestApiRepository<T extends RepoEntityBase> extends ApiEndpoint implements IRepository<T, AxiosRequestConfig> {

    protected readonly path: string

    constructor(
        protected readonly entityConstructor: RepoEntityStatic<T>,
        path: string,
        config?: AxiosRequestConfig,
    ) {
        super(config)

        if (path.startsWith('/')) {
            path = path.substring(1)
        }
        if (path.endsWith('/')) {
            path = path.substring(0, path.length - 1)
        }

        this.path = path
    }

    async create(entity: T, params?: AxiosRequestConfig): Promise<T> {
        const response = await this.postReq(this.getUrl(params), entity.getDataValues(), params)
        entity.setDataValues(response)
        return entity
    }

    async delete(entity: T, params?: AxiosRequestConfig): Promise<void> {
        await this.deleteItem(entity.getPkValue(), params)
    }

    async deleteByPk(pk: Identifier, params?: AxiosRequestConfig): Promise<void> {
        await this.deleteItem(pk, params)
    }

    async getAll(params?: AxiosRequestConfig): Promise<T[]> {
        const response = await this.getReq<T[]>(this.getUrl(params), params)
        return response.map(p => this.buildEntity(p))
    }

    async getOne(params?: AxiosRequestConfig): Promise<T> {
        const response = await this.getReq<T>(this.getUrl(params), params)
        return this.buildEntity(response)
    }

    async getByPk(pk: Identifier, params?: AxiosRequestConfig): Promise<T> {
        const response = await this.getReq<T>(`${this.getUrl(params)}/${pk.toString()}`, params)
        return this.buildEntity(response)
    }

    async paginate(page: number, limit: number, params?: AxiosRequestConfig): Promise<PaginatedData<T>> {
        const config = params || {}
        if (!config.params) {
            config.params = {}
        }
        config.params = { ...config.params, limit, page }
        const response = await this.getReq<PaginatedData<T>>(this.getUrl(params), config)
        const list = response.list.map(p => this.buildEntity(p))
        return new PaginatedData(list, response.total)
    }

    async save(entity: T, params?: AxiosRequestConfig): Promise<T> {
        const response = await this.putReq(this.getUrl(params), entity.getDataValues(), params)
        entity.setDataValues(response)
        return entity
    }

    protected getUrl(params?: AxiosRequestConfig): string {
        return this.path
    }

    protected buildEntity(data: Record<string, any>): T {
        const instance = new this.entityConstructor()
        instance.setDataValues(data)
        return instance
    }

    private async deleteItem(pk: Identifier, params?: AxiosRequestConfig): Promise<void> {
        return this.deleteReq(`${this.getUrl(params)}/${pk.toString()}`, params)
    }
}