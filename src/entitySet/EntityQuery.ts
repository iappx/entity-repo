import { RepoEntityBase, RepoEntityStatic } from '../entity'
import { ITransport } from '../transport'

export abstract class EntityQuery<T extends RepoEntityBase, TTransport extends ITransport<any>, TOptions extends {} = never> {
    constructor(
        public readonly entityConstructor: RepoEntityStatic<T>,
        protected readonly transport: TTransport,
        protected readonly options?: TOptions,
    ) {
    }
}
