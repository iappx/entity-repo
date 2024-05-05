import { DefaultEntitySet } from '../../entitySet'
import { RepoEntityBase } from '../../entity'
import { Constructor } from '../../types/Constructor'

export type EntitySetInfo = {
    entityConstructor: Constructor<RepoEntityBase>
    key: string
    repositoryParams?: Record<string, any>
    entitySetInstance?: DefaultEntitySet<any>
}