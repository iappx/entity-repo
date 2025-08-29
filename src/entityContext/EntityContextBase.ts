import { EntitySetInfo } from './types'
import { RepoEntityBase, RepoEntityStatic } from '../entity'
import { ITransport } from '../transport'
import { EntityQuery } from '../entitySet'

export abstract class EntityContextBase<TTransport extends ITransport<any>> {
    _entitySetInfo: Record<string, EntitySetInfo>

    constructor(
        protected readonly transport: TTransport,
    ) {
    }

    getEntitySet<T extends RepoEntityBase>(key: string, entity: RepoEntityStatic<T>): EntityQuery<T, TTransport, any> {
        const entitySetInfo = this._entitySetInfo[key]
        if (!entitySetInfo) {
            throw new Error('Entity set is not defined')
        }
        const { entityQueryCtor, entityConstructor, queryOptions } = entitySetInfo
        return new entityQueryCtor(entityConstructor, this.transport, queryOptions)
    }
}
