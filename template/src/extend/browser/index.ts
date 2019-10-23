import ComponentA from "./component-a";
import ComponentB from "./component-b";

export default {
  left: {
    type: "add",
    component: [
      {
        id: "componentA",
        icon: "octicon octicon-browser",
        panel: ComponentA
      }
    ]
  },
  right: {
    type: "add",
    component: [
      {
        id: "componentB",
        icon: "octicon octicon-browser",
        panel: ComponentB
      }
    ]
  }
};
