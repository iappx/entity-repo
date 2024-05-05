import { EntityContextBase } from '../../entityContext'
import { RepoEntityBase, RepoEntityStatic } from '../../entity'

export const RepoEntitySet = <TRepoParams extends {} = never>(entity: () => RepoEntityStatic<RepoEntityBase>, repositoryParams?: TRepoParams) =>
    <T extends EntityContextBase>(target: T, propertyKey: string) => {
        if (!target._entitySetInfo) {
            target._entitySetInfo = []
        }
        const entityConstructor = entity()
        target._entitySetInfo.push({
            entityConstructor,
            repositoryParams,
            key: propertyKey,
        })
        Object.defineProperty(target, propertyKey, {
            get: function(this: EntityContextBase) {
                return this.getEntitySet(propertyKey, entityConstructor)
            },
            set: function(this: EntityContextBase, value: any) {

            },
            enumerable: true,
            configurable: true,
        })
    }