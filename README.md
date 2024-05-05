# Entity Repo

The library allows you to abstract the data source at the expense of repositories and use context as the single point of access to a set of entities.

## Description

The set of entities supports CRUD operations - create, read, update, delete. In addition, all classes are extensible and allow to add necessary additional functionality.

The library includes a repository for accessing REST api endpoints.

Several classes with different purposes are used for the work:

- EntitySet - Set of methods for working with the entity repository
- Entity - Entity class with all fields
- Context - The main class in which the list of available entities
- Repository - A repository that describes how entities are retrieved. Must be universal and not tied to entity type
- RepositoryBuilder -The Repository builder


## Usage

### REST API

#### Entity

First, you need to create a set of entities. Each entity field must be labeled with the `@RepoEntityField` decorator.

You need to define the primary key of an entity, to pass it in the query string (In DELETE methods).
You can define a primary key through the `options.isPrimaryKey` flag.

Nested entities are also supported. To define a nested entity, its type must be passed to the decorator - `options.nestedType`.
The array is defined automatically based on the input data.

An example of creating a REST entity Account:

```ts
export class Book extends RepoEntityBase<Book> {
    @RepoEntityField({ isPrimaryKey: true })
    id: number

    @RepoEntityField()
    name: string
}

export class Account extends RepoEntityBase<Account> {
    @RepoEntityField({ isPrimaryKey: true })
    id: string

    @RepoEntityField()
    email: string

    @RepoEntityField({ nestedType: () => Book })
    books: Book[]
}
```

#### Repository

A repository is used to describe the way an entity is retrieved.
The library includes a base repository for the REST API: [RestApiRepository](./src/api/repository/RestApiRepository.ts)

It accepts the entity type, path, relative base url and axiosConfig for queries in the constructor.

#### RepositoryBuilder

Since individual authorization methods are used for each api, you need to create a `RepositoryBuilder` according to your application.

```ts
export class RestApiRepositoryBuilder extends RestApiRepositoryBuilderBase {
    constructor() {
        super('https://api.your.app', {
            headers: {
                'Authorization': 'Bearer {{accessToken}}'
            }
        })
    }
}
```

#### EntityContext

Context combines entities into a single list of fields.
Each field represents a data access point and is not directly related to the rest of the code (Repositories, etc.).

```ts
export class EntityContext extends EntityContextBase {
    @RestRepoEntitySet(() => Account, '/account')
    public accounts: DefaultEntitySet<Account>

    @RestRepoEntitySet(() => Book, '/book')
    public books: DefaultEntitySet<Book>
}
```

#### Creating EntityRepo

EntityRepo combines all the above classes and binds them according to certain rules.
In `.use()` the context and repository bindings are passed, which are used later.

```ts
const repo = EntityRepo.create()
    .use(EntityContext, new RestApiRepositoryBuilder())
```

You can then get the context from the repo and work with it as a data source.

```ts
const context = repo.getContext(EntityContext)
const account = new Account()
account.login = 'test@example.com'
await context.accounts.add(account)
const accounts = await context.accounts.paginate(0, 10)
console.log(accounts)
```

## Cookbook

### REST API with route params

For example, we need to support access points with `routeParams` (e.g. `/account/{id}/book`).

To do this, we need to create a new class, such as `EntityQueryBuilder`, which implements a proxy to `EntitySet` with additional features:

```ts
export type RouteParamsRequestConfig = AxiosRequestConfig & {
    routeParams?: Record<string, any>
}

export class EntityQueryBuilder<T, TGetParams extends {} = never, TRouteParams extends {} = never> {
    private routeParamsRecord: Record<string, any> = {}
    private filterData: string[] = []
    private orderByData: Record<string, any> = {}
    private getParamData: Record<string, any> = {}

    constructor(
        private readonly entitySet: EntitySet<any>,
    ) {
    }

    public setAccountId(id: number): EntityQueryBuilder<T, TGetParams, TRouteParams> {
        return this.routeParam('accountId' as any, id)
    }

    public queryParams(params: TGetParams): EntityQueryBuilder<T, TGetParams, TRouteParams> {
        this.getParamData = { ...this.getParamData, ...params }
        return this
    }

    public routeParam<TKey extends keyof TRouteParams & string>(key: TKey, value: TRouteParams[TKey]): EntityQueryBuilder<T, TGetParams, TRouteParams> {
        this.routeParamsRecord[key] = value
        return this
    }

    public routeParams(params: TRouteParams): EntityQueryBuilder<T, TGetParams, TRouteParams> {
        this.routeParamsRecord = _.assign(this.routeParamsRecord, params)
        return this
    }

    public filter<TKey extends keyof T & string>(field: string, operation: string, values: T[TKey] | T[TKey][]): EntityQueryBuilder<T, TGetParams, TRouteParams> {
        this.filterData.push(`${field} ${operation} ${Array.isArray(values) ? values.join(',') : values}`)
        return this
    }

    public orderBy(field: string, direction: 'ASC' | 'DESC'): EntityQueryBuilder<T, TGetParams, TRouteParams> {
        this.orderByData[field] = direction
        return this
    }

    async create(entity: T): Promise<void> {
        return this.entitySet.create(entity, this.createParams())
    }

    async delete(entity: T): Promise<void> {
        return this.entitySet.delete(entity, this.createParams())
    }

    async deleteByPk(pk: Identifier): Promise<void> {
        return this.entitySet.deleteByPk(pk, this.createParams())
    }

    async getAll(): Promise<T[]> {
        return this.entitySet.getAll(this.createParams())
    }

    async getOne(): Promise<T> {
        return this.entitySet.getOne(this.createParams())
    }

    async paginate(page: number, limit: number, params?: RouteParamsRequestConfig): Promise<PaginatedData<T>> {
        return this.entitySet.paginate(page, limit, this.createParams(params))
    }

    async getByPk(pk: Identifier): Promise<T> {
        return this.entitySet.getByPk(pk, this.createParams())
    }

    async save(entity: T): Promise<void> {
        return this.entitySet.save(entity, this.createParams())
    }

    private createParams(initial?: RouteParamsRequestConfig): RouteParamsRequestConfig {
        const config: RouteParamsRequestConfig = initial || {}
        if (!config.params) {
            config.params = {}
        }
        if (this.filterData) {
            const filter = _.cloneDeep(this.filterData)
            if (filter) {
                config.params = { ...config.params, filter }
            }
        }
        const keys = Object.keys(this.orderByData)
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            config.params[`orderBy[${key}]`] = this.orderByData[key].toString().toUpperCase()
        }
        if (Object.keys(this.getParamData).length > 0) {
            config.params = { ...config.params, ...this.getParamData }
        }
        if (this.routeParamsRecord) {
            config.routeParams = this.routeParamsRecord
        }
        return config
    }
}
```

Next is `EntitySet` itself, which extends `DefaultEntitySet`. It adds the `entitySet.query` method, which gives access to the created builder.

```ts
export class EntitySet<T extends RepoEntityBase, TGetParams extends {} = never, TRouteParams extends {} = never> extends DefaultEntitySet<T, RouteParamsRequestConfig> {
    constructor(entityConstructor: RepoEntityStatic<T>, repository: IRepository<T>) {
        super(entityConstructor, repository)
    }

    public query(): EntityQueryBuilder<T, TGetParams, TRouteParams> {
        return new EntityQueryBuilder<T, TGetParams, TRouteParams>(this)
    }
}
```

Then Repository:

```ts
export class CustomRepository<T extends RepoEntityBase> extends RestApiRepository<T> {
    constructor(
        entityConstructor: RepoEntityStatic<T>,
        path: string,
        protected readonly authData: AuthData,
    ) {
        super(entityConstructor, path, {
            timeout: 20000,
        })
        this.service.interceptors.request.use(
            config => {
                config.baseURL = Environment.apiUrl()
                if (!authData.empty()) {
                    config.headers.Authorization = authData.bearerToken
                }
                return config
            },
            error => {
                return Promise.reject(error)
            },
        )

        this.service.interceptors.response.use(
            response => {
                return response
            },
            error => {
                return Promise.reject(error)
            },
        )
    }

    protected getUrl(urlParams?: RouteParamsRequestConfig): string {
        let result = this.path
        if (urlParams?.routeParams) {
            const keys = Object.keys(urlParams.routeParams)
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i]
                result = result.replace(`{${key}}`, urlParams.routeParams[key])
            }
        }
        return result
    }
}
```

The `RestApiRepository.getUrl` method is overridden in this class.

RepositoryBuilder:

```ts
export class CustomRepositoryBuilder extends RestApiRepositoryBuilderBase {
    constructor(
        protected readonly authData: AuthData
    ) {
        super('')
    }

    build<T extends RepoEntityBase>(entityConstructor: RepoEntityStatic<T>, params: RestApiRepositoryBuilderParams): IRepository<T> {
        return new WnRepository(entityConstructor, params.endpointUrl!, this.authData)
    }
}
```

And finally, the context:

```ts
export class EntityContext extends EntityContextBase {
    @RestRepoEntitySet(() => Account, '/account')
    public accounts: EntitySet<Account>

    @RestRepoEntitySet(() => Book, '/account/{id}/books')
    public books: EntitySet<Book>
}
```

Usage:

```ts
const repo = EntityRepo.create()
    .use(EntityContext, new CustomRepositoryBuilder(AuthData.getFromLocalStorage()))
const context = repo.getContext(EntityContext)
const account = new Account()
account.login = 'test@example.com'
await context.accounts.add(account)
const accounts = await context.books.query().setAccountId(1).getAll()
```


### Repository in localstorage

#### Repository

Base class:

```ts
export abstract class SerializableStorageRepositoryBase<T extends RepoEntityBase> implements IRepository<T> {
    protected dataArray: T[] = []

    protected abstract saveAll(data: T[]): Promise<void>

    public abstract getAll(): Promise<T[]>

    async create(entity: T): Promise<T> {
        this.dataArray.push(entity)
        await this.saveAll(this.dataArray)
        return entity
    }

    async delete(entity: T): Promise<void> {
        await this.deleteByPk(entity.getPkValue())
    }

    async deleteByPk(pk: Identifier): Promise<void> {
        await this.update()
        const entityIndex = this.dataArray.findIndex(p => p.getPkValue() == pk)
        if (entityIndex > -1) {
            this.dataArray.splice(entityIndex, 1)
        }
        await this.saveAll(this.dataArray)
    }

    async getByPk(pk: Identifier): Promise<T> {
        await this.update()
        const index = this.dataArray.findIndex(p => p.getPkValue() == pk)
        return index > -1 ? this.dataArray[index] : null as any
    }

    async getOne(): Promise<T> {
        await this.update()
        return this.dataArray[0]
    }

    async paginate(page: number, limit: number): Promise<PaginatedData<T>> {
        await this.update()
        return new PaginatedData(this.dataArray.slice(page * limit, page * limit + limit), this.dataArray.length)
    }

    async save(entity: T): Promise<T> {
        await this.update()
        const index = this.dataArray.findIndex(p => p.getPkValue() == entity.getPkValue())
        if (index == -1) {
            this.dataArray.push(entity)
            await this.saveAll(this.dataArray)
            return entity
        }
        const savedEntity = this.dataArray[index]
        savedEntity.setDataValues(entity.getDataValues())
        await this.saveAll(this.dataArray)
        return entity
    }

    private async update(): Promise<void> {
        if (this.dataArray.length == 0) {
            this.dataArray = await this.getAll()
        }
    }
}
```

Repository:

```ts
export class LocalStorageRepository<T extends RepoEntityBase> extends SerializableStorageRepositoryBase<T> {
    protected readonly key: string

    constructor(
        protected readonly entityConstructor: RepoEntityStatic<T>,
        key?: string,
    ) {
        super()
        this.key = key || entityConstructor.name
    }

    protected async saveAll(data: T[]): Promise<void> {
        const rawData: string[] = []
        for (let i = 0; i < data.length; i++) {
            const entity = data[i]
            const raw = JSON.stringify(entity.getDataValues())
            rawData.push(raw)
        }
        localStorage.setItem(this.key, JSON.stringify(rawData))
    }

    async getAll(): Promise<T[]> {
        const result: T[] = []
        const rawData = localStorage.getItem(this.key)
        if (rawData) {
            try {
                const values = JSON.parse(Base64.b64ToString(rawData)) as string[]
                for (let i = 0; i < values.length; i++) {
                    const value = JSON.parse(values[i])
                    const entity = new this.entityConstructor()
                    entity.setDataValues(value)
                    result.push(entity)
                }
            } catch (err) {
                console.warn(err)
            }
        }
        return result
    }
}
```

#### RepositoryBuilder

```ts
type LocalStorageRepositoryBuilderParams = {
    key: string
}

export class LocalStorageRepositoryBuilder implements IRepositoryBuilder<LocalStorageRepositoryBuilderParams> {
    build<T extends RepoEntityBase>(entityConstructor: Constructor<T>, params: LocalStorageRepositoryBuilderParams): IRepository<T> {
        return new LocalStorageRepository(entityConstructor as any, params.key) as any
    }
}
```

#### Context

```ts
export class LocalStorageEntityContext extends EntityContextBase {

    @RepoEntitySet(() => Account, { key: 'accountsRepository' })
    public account: EntitySet<Account>
}
```

#### Usage

Usage is no different from the previous examples:

```ts
const repo = EntityRepo.create()
    .use(LocalStorageEntityContext, new LocalStorageRepositoryBuilder())
const context = repo.getContext(LocalStorageEntityContext)
const account = new Account()
account.id = 1
account.login = 'test@example.com'
await context.accounts.save(account)
const accounts = await context.accounts.getAll()
```
