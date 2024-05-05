import { IRepository } from './IRepository'
import { RepoEntityBase } from '../entity'
import { Constructor } from '../types/Constructor'

export interface IRepositoryBuilder<TParams extends {}> {
    build<T extends RepoEntityBase>(entityConstructor: Constructor<T>, params: TParams): IRepository<T>
}