import "@logseq/libs";
import "virtual:windi.css";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import { logseq as PL } from "../package.json";

// @ts-expect-error
const css = (t, ...args) => String.raw(t, ...args);

const pluginId = PL.id;

const isDev = process.env.NODE_ENV === "development";
const magicKey = `__${pluginId}__loaded__`;

function main() {
  console.info(`#${pluginId}: MAIN`);
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("app")
  );

  function createModel() {
    return {
      show() {
        logseq.showMainUI();
      },
    };
  }

  logseq.provideModel(createModel());
  logseq.setMainUIInlineStyle({
    zIndex: 11,
  });

  const openIconName = "template-plugin-open";

  if (isDev) {
    // @ts-expect-error
    top[magicKey] = true;
  }

  logseq.provideStyle(css`
    .${openIconName} {
      text-align: center;
      opacity: 0.55;
      font-weight: 500;
      padding: 0 5px;
      position: relative;
      min-width: 20px;
    }

    .${openIconName}:hover {
      opacity: 0.9;
    }
  `);

  logseq.App.registerUIItem("toolbar", {
    key: openIconName,
    template: `
      <a data-on-click="show"
         class="${openIconName}"
         style="opacity: .6; display: inline-flex;">
         E
      </a>
    `,
  });
}

logseq.ready(main).catch(console.error);
