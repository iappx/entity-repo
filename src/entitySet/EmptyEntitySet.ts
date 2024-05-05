import { Constructor } from '../types/Constructor'
import { IRepository } from '../repositories'
import { RepoEntityBase } from '../entity'

export class EmptyEntitySet<T extends RepoEntityBase, TAdditionalParams extends {} = never> {
    constructor(
        public readonly entityConstructor: Constructor<T>,
        protected readonly repository: IRepository<T, TAdditionalParams>,
    ) {
    }
}