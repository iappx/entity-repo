export class PaginatedData<T> {
    constructor(
        public list: T[],
        public total: number,
    ) {
    }
}