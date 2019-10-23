import * as kaitian from "kaitian";

export function activate(context: kaitian.ExtensionContext) {
  const { componentProxy, registerExtendModuleService } = context;
  let count = 0;

  registerExtendModuleService({
    async bizWorkerHello() {
      await componentProxy.componentA.changeTitle(`worker ${count++}`);
      await kaitian.layout.toggleBottomPanel();
      return "biz node message " + count;
    }
  });
}
