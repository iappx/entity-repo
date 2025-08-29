import { RepoEntityBase } from '../../entity'
import { Constructor } from '../../types/Constructor'
import { EntityQuery } from '../../entitySet'

export type EntitySetInfo = {
    entityConstructor: Constructor<RepoEntityBase>
    key: string
    entityQueryCtor: Constructor<EntityQuery<any, any, any>>
    queryOptions: Record<string, any>
}
