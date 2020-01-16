import ComponentA from "./component-a";
import ComponentB from "./component-b";
import * as kt from 'kaitian-browser';    // kaitian browser API

export default {
  left: {
    type: "add",
    component: [
      {
        id: "componentA",
        icon: 'extension',
        panel: ComponentA
      }
    ]
  },
  right: {
    type: "add",
    component: [
      {
        id: "componentB",
        icon: 'extension',
        panel: ComponentB
      }
    ]
  }
};
