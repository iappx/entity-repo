import { Constructor } from '../../types/Constructor'
import { RepoEntityBase } from '../RepoEntityBase'

export type EntityAttribute = {
    isPrimaryKey?: boolean
    nestedType?: () => Constructor<RepoEntityBase>
}