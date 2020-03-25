import * as React from "react";
import { useState, useEffect } from 'react';
import { Button } from 'kaitian-browser';

import { INodeService, IWorkerService } from "../common/service";
import './style.less';

const defaultTitle = "左侧面板";

export const ComponentA: React.FC<IComponentProps<INodeService, IWorkerService>> = ({
  kaitianExtendSet,
  kaitianExtendService,
}) => {
  const [title, setTitle] = useState(defaultTitle);

  function changeTitleHandler(val: string) {
    setTitle(defaultTitle + " " + val);
  }
  useEffect(() => {
    if (kaitianExtendSet) {
      kaitianExtendSet.set({
        changeTitle: changeTitleHandler,
      });
    }
  }, []);

  function clickHandler() {
    kaitianExtendService.node.bizHello().then(msg => {
      console.log("component a host msg", msg);
    });
  }

  return (
    <div className="kt-extension-example-container">
      <p>{title}</p>
      <Button onClick={clickHandler}>change title</Button>
    </div>
  );
}
