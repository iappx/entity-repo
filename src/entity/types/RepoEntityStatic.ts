import { RepoEntityBase } from '../RepoEntityBase'
import { NonConstructor } from './commonTypes'

export type RepoEntityStatic<M extends RepoEntityBase> =
    NonConstructor<typeof RepoEntityBase>
    & { new(): M };
