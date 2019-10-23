import * as React from "react";

import { INodeService, IWorkerService } from "../common/service";

const defaultTitle = "右侧定制组件";

export default class ComponentB extends React.Component<
  IComponentProps<INodeService, IWorkerService>,
  {}
> {
  state = {
    title: defaultTitle
  };

  changeTitleHandler = (val: string) => {
    this.setState({
      title: defaultTitle + " " + val
    });
  }

  clickHandler = () => {
    const { kaitianExtendService } = this.props;
    kaitianExtendService.worker.bizWorkerHello().then(msg => {
      console.log("component b host msg", msg);
    });
  }

  render() {
    return (
      <div onClick={this.clickHandler} style={{ color: "orange" }}>
        {this.state.title}
      </div>
    );
  }
}
