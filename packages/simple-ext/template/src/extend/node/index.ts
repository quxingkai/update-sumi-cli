import * as kaitian from "kaitian";   // kaitian node API (extends vscode)

export function activate(context: kaitian.ExtensionContext) {
  const { componentProxy, registerExtendModuleService } = context;
  let count = 0;

  registerExtendModuleService({
    async sayHello() {
      await componentProxy.Leftview.updateTitle('Hello KAITIAN Extension');
      await kaitian.layout.toggleBottomPanel();
      return "Hello KAITIAN Extension";
    }
  });
}
