import { EntityContextBase } from '../../entityContext'
import { RepoEntityBase, RepoEntityStatic } from '../../entity'
import { Constructor } from '../../types/Constructor'
import { ITransport } from '../../transport'
import { EntityQuery } from '../EntityQuery'

export const RepoEntitySet = <
    TEntity extends RepoEntityBase,
    TTransport extends ITransport<any>,
    TQueryOptions extends {} = never
>(
    entity: () => RepoEntityStatic<TEntity>,
    entityQuery: () => Constructor<EntityQuery<TEntity, TTransport, TQueryOptions>>,
    queryOptions?: TQueryOptions,
) =>
    <T extends EntityContextBase<TTransport>>(target: T, propertyKey: keyof T & string) => {
        const entityConstructor = entity()
        if (!target._entitySetInfo) {
            target._entitySetInfo = {}
        }
        target._entitySetInfo[propertyKey] = {
            entityConstructor,
            key: propertyKey,
            entityQueryCtor: entityQuery(),
            queryOptions,
        }
        delete target[propertyKey]
        Object.defineProperty(target, propertyKey, {
            get: function (this: EntityContextBase<TTransport>) {
                return this.getEntitySet(propertyKey, entityConstructor)
            },
            set: function (this: EntityContextBase<TTransport>, value: any) {

            },
            enumerable: true,
            configurable: true,
        })
    }
