
export interface INodeService {
    bizHello(): Promise<string>;
}

export interface IWorkerService {
    bizWorkerHello(): Promise<string>;
}
