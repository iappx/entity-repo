import { EntityContextBase } from './entityContext'
import { Constructor } from './types/Constructor'
import { ITransport } from './transport'

export class EntityRepo {
    private readonly entityContexts: Map<Constructor<EntityContextBase<any>>, ITransport<any>>

    constructor() {
        this.entityContexts = new Map<Constructor<EntityContextBase<any>>, ITransport<any>>()
    }

    public static create(): EntityRepo {
        return new EntityRepo()
    }

    public use<TTransport extends ITransport<any>>(context: Constructor<EntityContextBase<TTransport>>, transport: TTransport): EntityRepo {
        this.entityContexts.set(context, transport)
        return this
    }

    public getContext<T extends EntityContextBase<any>>(context: Constructor<T>): T {
        const transport = this.entityContexts.get(context)
        if (transport) {
            return new context(transport) as T
        }
        throw new Error('Context not found')
    }
}
