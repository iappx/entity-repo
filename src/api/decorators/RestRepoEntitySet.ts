import { RepoEntityBase, RepoEntityStatic } from '../../entity'
import { EntityContextBase } from '../../entityContext'
import { RepoEntitySet } from '../../entitySet'
import { RestApiRepositoryBuilderParams } from '../repository'

export const RestRepoEntitySet = (entity: () => RepoEntityStatic<RepoEntityBase>, endpointUrl: string, options?: Record<string, any>) =>
    <T extends EntityContextBase>(target: T, propertyKey: string) => {
        RepoEntitySet<RestApiRepositoryBuilderParams>(entity, {
            endpointUrl: endpointUrl,
            ...options,
        })(target, propertyKey)
    }