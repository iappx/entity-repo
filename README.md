<!-- Improved compatibility of back to top link -->
<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
<!--
*** Reference style links are defined at the bottom for readability.
*** Example: [![Contributors][contributors-shield]][contributors-url]
-->
[![NPM Version][npm-shield]][npm-url]
[![Issues][issues-shield]][issues-url]
[![License][license-shield]][license-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">Entity Repo</h3>

  <p align="center">
    A TypeScript library that fully abstracts your data source and provides a unified access point to entities through contexts.
    <br />
    <br />
    ·
    <a href="https://github.com/iappx/entity-repo/issues/new?labels=bug&template=bug-report.md">Report Bug</a>
    ·
    <a href="https://github.com/iappx/entity-repo/issues/new?labels=enhancement&template=feature-request.md">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#core-concepts">Core Concepts</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

Entity Repo is a lightweight and flexible TypeScript library designed to abstract your data source and make entity access seamless through a unified context system.

It provides a clean way to describe entities, register transports (data providers), and build queries with a builder-like pattern.

Here's why Entity Repo might be useful:
* Decouple your business logic from the actual data source
* Keep your codebase consistent by accessing data only through contexts
* Extendable by custom transports, queries, and contexts

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Core Concepts

The main components of Entity Repo are `EntitySet`, `Entity`, `Context`, and `Transport`.

#### RepoEntity
Base class for declaring entities.  
Example:

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

#### Transport
A transport handles communication with the data source and must implement the `ITransport` interface.  
Example Axios transport:

```ts
export class AxiosTransport implements ITransport<AxiosRequestConfig> {
  protected client: Axios

  constructor(config?: AxiosRequestConfig) {
    this.client = new Axios(config)
  }

  async send<TRes>(config: AxiosRequestConfig): Promise<TRes> {
    return this.client.request(config)
  }
}
```

#### EntityQuery
Represents entity access logic and can implement custom query methods. It inherits from the base `EntityQuery` and can be used as a builder.

```ts
export type TRestEntitySetQueryParams = {
    endpoint: string
}

export type TQueryParams = {
    appId: string
}

export class RestEntityQuery<T extends RepoEntityBase> extends EntityQuery<T, AxiosTransport, TRestEntitySetQueryParams> {

    private queryParams: TQueryParams

    public addQueryParams(params: TQueryParams): RestEntityQuery<T> {
        this.queryParams = {
            ...this.queryParams,
            ...params,
        }
        return this
    }

    public async getAll(): Promise<T[]> {
        const response = await this.transport.send<any[]>({
            url: this.options.endpoint,
        })
        return response.map(p => this.entityConstructor.build(p))
    }

    public async create(entity: T): Promise<T> {
        const response = await this.transport.send<Record<string, any>>({
            url: this.options.endpoint,
            method: 'POST',
            data: entity.getDataValues(),
        })
        return this.entityConstructor.build(response)
    }
}
```

#### EntityContext
Combines entities into a single access point, without direct dependency on repositories or other services.

```ts
export class EntityContext extends EntityContextBase<AxiosTransport> {
  @RepoEntitySet(() => Account, () => RestEntityQuery, { endpoint: '/api/account' })
  public accounts: RestEntityQuery<Account>
}
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

### Prerequisites
* Node.js >= 18
* npm or yarn

```sh
npm install npm@latest -g
```

### Installation

```sh
npm install @iappx/entity-repo
# or
yarn add @iappx/entity-repo
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

Here’s an example of how to combine everything:

```ts
const repo = EntityRepo.create()
  .use(EntityContext, new AxiosTransport({ baseURL: 'https://api.your.app' }))

const context = repo.getContext(EntityContext)

const accounts = await context.accounts
  .addQueryParams({ appId: 'test-app' })
  .getAll()
console.log('accounts', accounts)

const newAccount = Account.build({ email: 'user@example.com' })
await context.accounts
  .addQueryParams({ appId: 'test-app' })
  .create(newAccount)
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
[npm-shield]: https://img.shields.io/npm/v/entity-repo.svg
[npm-url]: https://www.npmjs.com/@iappx/entity-repo
[issues-shield]: https://img.shields.io/github/issues/iappx/entity-repo.svg
[issues-url]: https://github.com/iappx/entity-repo/issues
[license-shield]: https://img.shields.io/github/license/iappx/entity-repo.svg
[license-url]: https://github.com/iappx/entity-repo/blob/main/LICENSE
