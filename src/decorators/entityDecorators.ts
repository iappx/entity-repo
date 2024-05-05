import { EntityAttribute, RepoEntityBase } from '../entity'

export const RepoEntityField = (options?: Partial<EntityAttribute>) => <T extends RepoEntityBase>(target: T, propertyKey: string) => {
    if (!target._attributeInfo) {
        target._attributeInfo = {}
    }
    target._attributeInfo[propertyKey] = options || {}
    delete target[propertyKey]
    Object.defineProperty(target, propertyKey, {
        get: function(this: RepoEntityBase) {
            return this.getDataValue(propertyKey)
        },
        set: function <K extends keyof T>(this: T, value: T[K]) {
            this.setDataValue(propertyKey, value)
        },
        enumerable: true,
        configurable: true,
    })
}