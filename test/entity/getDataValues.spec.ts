import { TestEntity } from './models/TestEntity'
import { TestNestedEntity } from './models/TestNestedEntity'

describe('Entity.getDataValues', () => {
    it('simple', () => {
        const id = 1
        const entity = new TestEntity()
        entity.id = id
        const dataValuesResult = entity.getDataValues()
        expect(dataValuesResult.id).toBe(id)
    })

    it('nested entity', () => {
        const id = 1
        const entity = new TestEntity()
        entity.nestedEntity = new TestNestedEntity()
        entity.nestedEntity.id = id
        const dataValuesResult = entity.getDataValues()
        expect(dataValuesResult.nestedEntity.id).toBe(id)
    })

    it('nested entity array', () => {
        const id = 1
        const entity = new TestEntity()
        entity.nestedEntityArray = [
            new TestNestedEntity()
        ]
        entity.nestedEntityArray[0].id = id
        const dataValuesResult = entity.getDataValues()
        expect(dataValuesResult.nestedEntityArray[0].id).toBe(id)
    })
})