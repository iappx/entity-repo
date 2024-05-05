import { EntitySetInfo } from './types'
import { RepoEntityBase, RepoEntityStatic } from '../entity'
import { DefaultEntitySet } from '../entitySet'
import { IRepository, IRepositoryBuilder } from '../repositories'

export abstract class EntityContextBase<TEntitySet extends DefaultEntitySet<any> = DefaultEntitySet<any>> {
    _entitySetInfo: EntitySetInfo[]

    constructor(
        protected readonly repositoryBuilder: IRepositoryBuilder<any>,
    ) {
    }

    getEntitySet<T extends RepoEntityBase>(key: string, entity: RepoEntityStatic<T>): TEntitySet {
        const entitySetInfo = this._entitySetInfo.filter(p => p.entityConstructor == entity && p.key == key)
        if (!entitySetInfo) {
            throw new Error('Entity set is not defined')
        }
        const info = entitySetInfo[0]
        const { repositoryParams, entitySetInstance } = info
        if (entitySetInstance) {
            return entitySetInstance as TEntitySet
        }
        const repository = this.repositoryBuilder.build(entity, repositoryParams)
        const entitySet = this.buildEntitySet(entity, repository)
        info.entitySetInstance = entitySet
        return entitySet
    }

    protected buildEntitySet<T extends RepoEntityBase>(entity: RepoEntityStatic<T>, repository: IRepository<T>): TEntitySet {
        return new DefaultEntitySet<T, never>(entity, repository) as TEntitySet
    }
}