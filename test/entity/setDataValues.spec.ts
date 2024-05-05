import { TestEntity } from './models/TestEntity'
import { TestNestedEntity } from './models/TestNestedEntity'

const testEntityData = {
    id: 1,
    stringField: '123',
    numberField: 123,
}

describe('Entity.setDataValues', () => {
    describe('primary key', () => {
        it('direct', () => {
            const id = 1
            const entity = new TestEntity()
            entity.id = id
            expect(entity.id).toBe(id)
            expect(entity.getPkValue()).toBe(id)
        })

        it('with data values', () => {
            const id = 2
            const entity = new TestEntity()
            entity.setDataValues({
                id: id,
            })
            expect(entity.id).toBe(id)
            expect(entity.getPkValue()).toBe(id)
        })

        it('with data value', () => {
            const id = 2
            const entity = new TestEntity()
            entity.setDataValue('id', id)
            expect(entity.id).toBe(id)
            expect(entity.getPkValue()).toBe(id)
        })
    })

    describe('data values', () => {
        it('direct', () => {
            const id = 1
            const stringValue = 'test val'
            const numValue = 123
            const entity = new TestEntity()
            entity.id = id
            entity.stringField = stringValue
            entity.numberField = numValue
            expect(entity.stringField).toBe(stringValue)
        })

        it('with data values', () => {
            const id = 1
            const stringValue = 'test val'
            const numValue = 123
            const entity = new TestEntity()
            entity.setDataValues({
                id: id,
                stringField: stringValue,
                numberField: numValue,
            })
            expect(entity.stringField).toBe(stringValue)
        })

        it('with data value', () => {
            const id = 1
            const stringValue = 'test val'
            const numValue = 123
            const entity = new TestEntity()
            entity.setDataValue('id', id)
            entity.setDataValue('stringField', stringValue)
            entity.setDataValue('numberField', numValue)
            expect(entity.id).toBe(id)
            expect(entity.stringField).toBe(stringValue)
        })
    })

    describe('Nested entity', () => {
        it('direct set', () => {
            const entity = new TestEntity()
            entity.setDataValues(testEntityData)
            const nested = new TestNestedEntity()
            nested.setDataValues({ id: 2 })
            entity.nestedEntity = nested
            expect(entity.getDataValue('nestedEntity')).toEqual(nested)
        })

        it('with data values', () => {
            const entity = new TestEntity()
            entity.setDataValues(testEntityData)
            const nested = new TestNestedEntity()
            nested.setDataValues({ id: 2 })
            entity.setDataValues({
                'nestedEntity': nested,
            })
            expect(entity.getDataValue('nestedEntity')).toEqual(nested)
        })

        it('with data value', () => {
            const entity = new TestEntity()
            entity.setDataValues(testEntityData)
            const nested = new TestNestedEntity()
            nested.setDataValues({ id: 2 })
            entity.setDataValue('nestedEntity', nested)
            expect(entity.getDataValue('nestedEntity')).toEqual(nested)
        })

        it('set raw data', () => {
            const nestedId = 2
            const entity = new TestEntity()
            entity.setDataValues({
                ...testEntityData,
                nestedEntity: {
                    id: nestedId,
                    numField: 222,
                },
            })
            const nested = entity.nestedEntity
            expect(nested.getDataValue('id')).toEqual(nestedId)
        })
    })
})