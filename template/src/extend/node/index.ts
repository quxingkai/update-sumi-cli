import * as kaitian from "kaitian";

export function activate(context: kaitian.ExtensionContext) {
  const { componentProxy } = context;
  let count = 0;
  return {
    async bizHello() {
        await componentProxy.componentA.changeTitle(`node ${count++}`);
        await kaitian.layout.toggleBottomPanel();
        return "biz node message " + count;
      }
  };
}
