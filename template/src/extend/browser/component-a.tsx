import * as React from "react";

import { INodeService, IWorkerService } from "../common/service";

const defaultTitle = "定制组件";

export default class ComponentA extends React.Component<
  IComponentProps<INodeService, IWorkerService>,
  {}
> {
  state = {
    title: defaultTitle
  };

  componentDidMount() {
    const { kaitianExtendSet } = this.props;

    if (kaitianExtendSet) {
      kaitianExtendSet.set({
        changeTitle: this.changeTitleHandler
      });
    }
  }

  changeTitleHandler = (val: string) => {
    this.setState({
      title: defaultTitle + " " + val
    });
  }

  clickHandler = () => {
    if (this.props.kaitianExtendService) {
      const kaitianExtendService = this.props.kaitianExtendService;
      kaitianExtendService.node.bizHello().then(msg => {
        console.log("component a host msg", msg);
      });
    }
  }

  render() {
    return (
      <div onClick={this.clickHandler} style={{ color: "yellow" }}>
        {this.state.title}
      </div>
    );
  }
}
