import { IRepositoryBuilder } from './repositories'
import { EntityContextBase } from './entityContext'
import { Constructor } from './types/Constructor'

export class ApiEntityRepo {
    private readonly entityContexts: Map<Constructor<EntityContextBase>, IRepositoryBuilder<any>>

    constructor() {
        this.entityContexts = new Map<Constructor<EntityContextBase>, IRepositoryBuilder<any>>()
    }

    public static create(): ApiEntityRepo {
        return new ApiEntityRepo()
    }

    public use(context: Constructor<EntityContextBase>, repositoryBuilder: IRepositoryBuilder<any>): ApiEntityRepo {
        this.entityContexts.set(context, repositoryBuilder)
        return this
    }

    public getContext<T extends EntityContextBase>(context: Constructor<T>): T {
        const item = this.entityContexts.get(context)
        if (item) {
            return new context(item) as T
        }
        throw new Error('Context not found')
    }
}