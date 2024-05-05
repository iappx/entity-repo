import { IRepository, IRepositoryBuilder } from '../../repositories'
import { RepoEntityBase, RepoEntityStatic } from '../../entity'
import { RestApiRepository } from './RestApiRepository'
import { RestApiRepositoryBuilderParams } from './types'
import { AxiosRequestConfig } from 'axios'

export abstract class RestApiRepositoryBuilderBase implements IRepositoryBuilder<RestApiRepositoryBuilderParams> {
    constructor(
        protected readonly baseUrl: string,
        protected readonly config?: AxiosRequestConfig,
    ) {
    }

    build<T extends RepoEntityBase>(entityConstructor: RepoEntityStatic<T>, params: RestApiRepositoryBuilderParams): IRepository<T> {
        return new RestApiRepository(entityConstructor, params.endpointUrl, {
            baseURL: this.baseUrl,
            ...this.config,
        })
    }
}