import { Identifier } from '../types'
import { PaginatedData } from './models/PaginatedData'

export interface IRepository<
    T = any,
    TAdditionalParams extends {} = never
> {
    getAll(params?: TAdditionalParams): Promise<T[]>

    getOne(params?: TAdditionalParams): Promise<T>

    paginate(page: number, limit: number, params?: TAdditionalParams): Promise<PaginatedData<T>>

    deleteByPk(pk: Identifier, params?: TAdditionalParams): Promise<void>

    delete(entity: T, params?: TAdditionalParams): Promise<void>

    save(entity: T, params?: TAdditionalParams): Promise<T>

    getByPk(pk: Identifier, params?: TAdditionalParams): Promise<T>

    create(entity: T, params?: TAdditionalParams): Promise<T>
}