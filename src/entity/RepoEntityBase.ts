import { EntityAttribute } from './types'
import { Identifier } from '../types'

export abstract class RepoEntityBase<TModelAttributes extends {} = any> {
    _attributes: TModelAttributes

    _attributeInfo: Record<keyof TModelAttributes, EntityAttribute>

    protected dataValues: TModelAttributes

    public static build<T extends RepoEntityBase>(this: new () => T, data: Record<string, any>): T {
        const instance = new this()
        instance.setDataValues(data)
        return instance
    }

    public getPkValue(): Identifier {
        const attributeKeys = Object.keys(this._attributeInfo)
        for (let i = 0; i < attributeKeys.length; i++) {
            const key = attributeKeys[i]
            const attribute = this._attributeInfo[key] as EntityAttribute
            if (attribute.isPrimaryKey) {
                return this.getDataValue(key as keyof TModelAttributes) as Identifier
            }
        }
        throw new Error('Primary key not found')
    }

    public getDataValue<K extends keyof TModelAttributes>(key: K): TModelAttributes[K] | undefined {
        if (!this._attributeInfo || !this._attributeInfo[key]) {
            return undefined
        }
        if (!this.dataValues) {
            this.dataValues = {} as TModelAttributes
        }
        return this.dataValues[key]
    }

    public setDataValue<K extends keyof TModelAttributes>(key: K | string, value: TModelAttributes[K] | any): void {
        if (!this.dataValues) {
            this.dataValues = {} as TModelAttributes
        }
        if (!this._attributeInfo) {
            return
        }
        const _key = key as K
        const attributeInfo = this._attributeInfo[_key]
        if (attributeInfo) {
            if (attributeInfo.nestedType) {
                if (!value) {
                    return
                }
                if (value.dataValues !== undefined && typeof value.setDataValue == 'function' && typeof value.getDataValue == 'function') {
                    this.dataValues[_key] = value
                    return
                }
                const typeConstructor = attributeInfo.nestedType()
                let result: any
                if (Array.isArray(value)) {
                    result = []
                    for (let i = 0; i < value.length; i++) {
                        const item = value[i]
                        const internalEntity = new typeConstructor()
                        internalEntity.setDataValues(item)
                        result.push(internalEntity)
                    }
                } else {
                    const internalEntity = new typeConstructor()
                    internalEntity.setDataValues(value)
                    result = internalEntity
                }
                this.dataValues[_key] = result
            } else {
                this.dataValues[_key] = value
            }
        }
    }

    public getDataValues(): TModelAttributes {
        const result: Record<string, any> = {}
        const attributeKeys = Object.keys(this._attributeInfo)
        for (let i = 0; i < attributeKeys.length; i++) {
            const key = attributeKeys[i]
            const attribute = this._attributeInfo[key] as EntityAttribute
            const dataValue = this.dataValues[key]
            if (dataValue !== undefined) {
                if (attribute.nestedType) {
                    if (dataValue.getDataValues) {
                        result[key] = dataValue.getDataValues()
                    } else if (Array.isArray(dataValue)) {
                        result[key] = []
                        for (let j = 0; j < dataValue.length; j++) {
                            const value = dataValue[j]
                            if (value.getDataValues) {
                                result[key].push(value.getDataValues())
                            } else {
                                result[key].push(value)
                            }
                        }
                    }
                } else {
                    result[key] = dataValue
                }
            }
        }
        return result as TModelAttributes
    }

    public setDataValues<K extends keyof TModelAttributes>(data: Record<string, any>): void {
        if (!data) {
            return
        }
        const keys = Object.keys(data)
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            const value = data[key]
            this.setDataValue(key, value)
        }
    }
}
