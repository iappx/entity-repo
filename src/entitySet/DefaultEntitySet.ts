import { Identifier } from '../types'
import { PaginatedData } from '../repositories'
import { RepoEntityBase } from '../entity'
import { EmptyEntitySet } from './EmptyEntitySet'

export class DefaultEntitySet<T extends RepoEntityBase, TAdditionalParams extends {} = never> extends EmptyEntitySet<T, TAdditionalParams> {
    public async create(entity: T, params?: TAdditionalParams): Promise<void> {
        const result = await this.repository.create(entity, params)
        entity.setDataValues(result)
    }

    public async delete(entity: T, params?: TAdditionalParams): Promise<void> {
        await this.repository.delete(entity, params)
    }

    public async deleteByPk(pk: Identifier, params?: TAdditionalParams): Promise<void> {
        await this.repository.deleteByPk(pk, params)
    }

    public async getAll(params?: TAdditionalParams): Promise<T[]> {
        return this.repository.getAll(params)
    }

    public async getOne(params?: TAdditionalParams): Promise<T> {
        return this.repository.getOne(params)
    }

    public async paginate(page: number, limit: number, params?: TAdditionalParams): Promise<PaginatedData<T>> {
        return this.repository.paginate(page, limit, params)
    }

    public async getByPk(pk: Identifier, params?: TAdditionalParams): Promise<T> {
        return this.repository.getByPk(pk, params)
    }

    public async save(entity: T, params?: TAdditionalParams): Promise<void> {
        const res = await this.repository.save(entity, params)
        entity.setDataValues(res)
    }
}