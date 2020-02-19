import * as kaitian from "kaitian";   // kaitian node API (extends vscode)

export function activate(context: kaitian.ExtensionContext) {
  const { componentProxy, registerExtendModuleService } = context;
  let count = 0;
  
  registerExtendModuleService({
    async bizHello() {
      await componentProxy.componentA.changeTitle(`node ${count++}`);
      await kaitian.layout.toggleBottomPanel();
      return "biz node message " + count;
    }
  });
}
