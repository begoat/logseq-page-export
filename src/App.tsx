import React, { useCallback, useEffect, useState } from "react";
import {
  useAppVisible,
  exportToPngImgUrl,
  savePngImgUrl,
  useEventListener,
  getExportName,
} from "./utils";

const HIDE_UI_KEY_LIST = ["Escape"];
const defaultIgnoreClassName = [
  // ignore other plguin icons in page toolbar
  "ui-items-container",
  // ignore reference link block
  "references",
];
function App() {
  const [querySelector, setQuerySelector] = useState("#main-content-container");
  const [ignoreClassName, setIgnoreClassName] = useState(
    defaultIgnoreClassName.join(" ")
  );
  const [imageUrl, setImageUrl] = useState("");
  const [pageName, setPageName] = useState("logseq_export");
  const visible = useAppVisible();
  useEventListener(
    "keydown",
    (e: KeyboardEvent) => {
      if (HIDE_UI_KEY_LIST.indexOf(e.key) !== -1) {
        window.logseq.hideMainUI();
      }
    },
    document
  );

  const exportOnce = useCallback(() => {
    setImageUrl("");
    exportToPngImgUrl(querySelector, ignoreClassName.split(" ")).then(
      (url: string) => {
        setImageUrl(url);
      }
    );
  }, [querySelector, ignoreClassName]);

  useEffect(() => {
    if (visible) {
      exportOnce();
      getExportName().then((name) => {
        setPageName(name);
      });
    }
  }, [visible]);

  if (visible) {
    return (
      <main className="backdrop-filter backdrop-blur-md fixed inset-0 flex flex-col items-center justify-center">
        <div className="text-black bg-white p-30 rounded">
          <h1 className="text-2xl text-center">
            Welcome to use [[Logseq Page Export]]
          </h1>
          <br />
          <br />
          <div className="flex item-center justify-between">
            <div className="inline-flex items-center">
              <span>ignoreClassName</span>
              <span className="text-[10px] ml-2 inline-block">
                (ignore elements by class(separate by space))
              </span>
            </div>
            <input
              type="text"
              value={ignoreClassName}
              onChange={(e) => {
                setIgnoreClassName(e.target.value);
              }}
              className="ml-10 border-2 border-slate-100 grow w-[220px]"
            ></input>
          </div>
          <div className="mt-6 flex item-center justify-between">
            <div className="inline-flex items-center">
              <span>querySelector</span>
              <span className="text-[10px] ml-2 inline-block">
                (querySelector for target dom to export)
              </span>
            </div>
            <input
              type="text"
              value={querySelector}
              onChange={(e) => {
                setQuerySelector(e.target.value);
              }}
              className="ml-10 border-2 border-slate-100 grow w-[220px]"
            ></input>
          </div>
          <div className="min-h-[304px] overflow-hidden border-2 border-slate-100 mt-2 flex justify-center content-center max-w-screen-sm min-w-screen-sm">
            {imageUrl ? (
              <img
                src={imageUrl}
                className="my-0 mx-auto max-h-[300px] overflow-hidden"
              />
            ) : (
              <span className="text-center">Loading...</span>
            )}
          </div>
          <button
            className="mt-2 px-6 py-2 bg-yellow-500 font-medium text-sm hover:bg-yellow-600 text-yellow-100 rounded"
            onClick={() => {
              exportOnce();
            }}
          >
            Preview Page
          </button>
          <button
            className="ml-2 px-6 py-2 bg-blue-500 font-medium text-sm hover:bg-blue-600 text-blue-100 rounded"
            onClick={() => {
              savePngImgUrl(imageUrl, pageName);
            }}
          >
            Save To Disk
          </button>
        </div>
      </main>
    );
  }

  return null;
}

export default App;
