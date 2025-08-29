export interface ITransport<TSendParams> {
    send<TRes>(params: TSendParams): Promise<TRes>
}
