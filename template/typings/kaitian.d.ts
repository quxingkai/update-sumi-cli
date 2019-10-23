declare module "kaitian" {
  export namespace layout {
    export function toggleBottomPanel(): Promise<void>;
  }

  export namespace ideWindow {
    export function reloadWindow(): void;
  }

  interface IProxy {
    [methodName: string]: Function;
  }

  interface IComponentProxy {
    [comonentIds: string]: IProxy;
  }

  export interface ExtensionContext {
    registerExtendModuleService(service: any): void;

    componentProxy: IComponentProxy;
  }
}

interface IComponentMethod {
  [methodName: string]: Function;
}

interface IComponentProps<N, W> {
  kaitianExtendSet: {
    set(methods: IComponentMethod): void;
  };
  kaitianExtendService: {
    node: N;
    worker: W;
  };
}
