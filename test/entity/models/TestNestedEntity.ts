import { RepoEntityBase, RepoEntityField } from '../../../src'

export class TestNestedEntity extends RepoEntityBase<TestNestedEntity> {
    @RepoEntityField({ isPrimaryKey: true })
    public id: number

    @RepoEntityField()
    public stringField: string

    @RepoEntityField()
    public numberField: number
}