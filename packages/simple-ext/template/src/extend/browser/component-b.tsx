import * as React from "react";
import { useState, useEffect } from 'react';
import { Button } from 'kaitian-browser';

import { INodeService, IWorkerService } from "../common/service";

const defaultTitle = "右侧面板";

export const ComponentB: React.FC<IComponentProps<INodeService, IWorkerService>> = ({
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
    kaitianExtendService.worker.bizWorkerHello().then(msg => {
      console.log("component b host msg", msg);
    });
  }

  return (
    <div>
      <p>{title}</p>
      <Button onClick={clickHandler}>change title</Button>
    </div>
  );
}
