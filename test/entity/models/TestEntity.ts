import { RepoEntityBase, RepoEntityField } from '../../../src'
import { TestNestedEntity } from './TestNestedEntity'

export class TestEntity extends RepoEntityBase<TestEntity> {
    @RepoEntityField({ isPrimaryKey: true })
    public id: number

    @RepoEntityField()
    public stringField: string

    @RepoEntityField()
    public numberField: number

    @RepoEntityField({ nestedType: () => TestNestedEntity })
    public nestedEntity: TestNestedEntity

    @RepoEntityField({ nestedType: () => TestNestedEntity })
    public nestedEntityArray: TestNestedEntity[]
}