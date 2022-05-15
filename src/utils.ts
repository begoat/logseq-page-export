import React, { KeyboardEventHandler, useState } from "react";
import { useMountedState } from "react-use";
import html2canvas from "html2canvas";

export const useAppVisible = () => {
  const [visible, setVisible] = useState(logseq.isMainUIVisible);
  const isMounted = useMountedState();
  React.useEffect(() => {
    const eventName = "ui:visible:changed";
    const handler = async ({ visible }: any) => {
      if (isMounted()) {
        setVisible(visible);
      }
    };
    logseq.on(eventName, handler);
    return () => {
      logseq.off(eventName, handler);
    };
  }, []);
  return visible;
};

export const useSidebarVisible = () => {
  const [visible, setVisible] = useState(false);
  const isMounted = useMountedState();
  React.useEffect(() => {
    logseq.App.onSidebarVisibleChanged(({ visible }) => {
      if (isMounted()) {
        setVisible(visible);
      }
    });
  }, []);
  return visible;
};

export const usePageName = () => {
  const [name, setName] = useState("");
  const isMounted = useMountedState();
  React.useEffect(() => {
    if (isMounted()) {
      setName("123123");
    }
  }, []);
  return name;
};

/**
 * https://usehooks.com/useEventListener/
 */
export const useEventListener = (
  eventName: string,
  handler: Function,
  element: HTMLElement | Document
) => {
  // Create a ref that stores handler
  const savedHandler = React.useRef<Function>(handler);
  // Update ref.current value if handler changes.
  // This allows our effect below to always get latest handler ...
  // ... without us needing to pass it in effect deps array ...
  // ... and potentially cause effect to re-run every render.
  React.useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  React.useEffect(
    () => {
      // Make sure element supports addEventListener
      // On
      const isSupported = element && element.addEventListener;
      if (!isSupported) return;
      // Create event listener that calls handler function stored in ref
      const eventListener = (event: Event) => savedHandler.current(event);
      // Add event listener
      element.addEventListener(eventName, eventListener);
      // Remove event listener on cleanup
      return () => {
        element.removeEventListener(eventName, eventListener);
      };
    },
    [eventName, element] // Re-run if eventName or element changes
  );
};

// https://stackoverflow.com/a/61986511/8106429
const extractParentCss = () => {
  const allCSS = [...parent.document.styleSheets]
    .map((styleSheet) => {
      try {
        return [...styleSheet.cssRules].map((rule) => rule.cssText).join("");
      } catch (e) {
        console.log(
          "Access to stylesheet %s is denied. Ignoring...",
          styleSheet.href
        );
      }
    })
    .filter(Boolean)
    .join("\n");

  return allCSS;
};

const injectStylesToTargetDocument = (
  cssText: string,
  targetDom = document
) => {
  const newSS = targetDom.createElement("link");
  newSS.rel = "stylesheet";
  newSS.href = "data:text/css," + encodeURIComponent(cssText);
  targetDom.getElementsByTagName("head")[0].appendChild(newSS);
};

export const exportToPngImgUrl = (
  querySelector: string,
  ignoreClassNameList: Array<string>
): Promise<string> => {
  // the plugin itself is loaded in a iframe
  const targetDom = parent.document.querySelector(querySelector) as HTMLElement;
  const bgColor = parent
    .getComputedStyle(parent.document.body, null)
    .getPropertyValue("background-color");

  return html2canvas(targetDom, {
    // https://html2canvas.hertzen.com/configuration
    allowTaint: true,
    useCORS: true,
    backgroundColor: bgColor,
    ignoreElements: (element) => {
      return ignoreClassNameList.some((i) => {
        const { className } = element;
        if (typeof className === "string") {
          return className.indexOf(i) !== -1;
        }

        return false;
      });
    },
    onclone: (clonedDocument) => {
      injectStylesToTargetDocument(extractParentCss(), clonedDocument);
      return clonedDocument;
    },
  }).then((canvas) => {
    const imageUrl = canvas.toDataURL("image/png");
    return imageUrl;
  });
};

export const savePngImgUrl = (imageUrl: string, filename: string) => {
  let a = document.createElement("a");
  a.href = imageUrl;
  a.download = filename;
  a.click();
};
