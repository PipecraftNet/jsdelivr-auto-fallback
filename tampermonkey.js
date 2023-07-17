// ==UserScript==
// @name Jsdelivr Auto Fallback
// @namespace https://github.com/PipecraftNet/jsdelivr-auto-fallback
// @version 0.2.4
// @author PipecraftNet&DreamOfIce
// @description 修复 cdn.jsdelivr.net 无法访问的问题
// @homepage https://github.com/PipecraftNet/jsdelivr-auto-fallback
// @downloadURL https://greasyfork.org/scripts/445701-jsdelivr-auto-fallback/code/Jsdelivr%20Auto%20Fallback.user.js
// @updateURL https://greasyfork.org/scripts/445701-jsdelivr-auto-fallback/code/Jsdelivr%20Auto%20Fallback.user.js
// @supportURL https://github.com/PipecraftNet/jsdelivr-auto-fallback/issues
// @license MIT
// @match *://*/*
// @run-at document-start
// @grant GM.setValue
// @grant GM.getValue
// @grant GM_addElement
// ==/UserScript==

(async (document) => {
  'use strict';
  let fastNode;
  let failed;
  let isRunning;
  const DEST_LIST = [
    'cdn.jsdelivr.net',
    'fastly.jsdelivr.net',
    'gcore.jsdelivr.net',
    'cdn.zenless.top',
    'testingcf.jsdelivr.net',
    'test1.jsdelivr.net'
  ];
  const PREFIX = '//';
  const SOURCE = DEST_LIST[0];
  const starTime = Date.now();
  const TIMEOUT = 2000;
  const STORE_KEY = 'jsdelivr-auto-fallback';
  const TEST_PATH = '/gh/PipecraftNet/jsdelivr-auto-fallback@main/empty.css?';
  const shouldReplace = (text) => text && text.includes(PREFIX + SOURCE);
  const replace = (text) => text.replace(PREFIX + SOURCE, PREFIX + fastNode);
  const $ = document.querySelectorAll.bind(document);
  const setAttributes = (element, attributes) => {
    if (element && attributes) {
      for (const name in attributes) {
        if (Object.hasOwn(attributes, name)) {
          const value = attributes[name];
          if (value === undefined) {
            continue;
          }

          element.setAttribute(name, value);
        }
      }
    }

    return element;
  };

  const createElement = (tagName, attributes) =>
    setAttributes(document.createElement(tagName), attributes);
  const addElement =
    typeof GM_addElement === 'function'
      ? GM_addElement
      : (parentNode, tagName, attributes) => {
          if (!parentNode) {
            return;
          }

          if (typeof parentNode === 'string') {
            attributes = tagName;
            tagName = parentNode;
            parentNode = document.head;
          }

          const element = createElement(tagName, attributes);
          parentNode.append(element);
          return element;
        };

  const replaceElementSrc = () => {
    let element;
    let value;
    for (element of $('link[rel="stylesheet"]')) {
      value = element.href;
      if (shouldReplace(value) && !value.includes(TEST_PATH)) {
        element.href = replace(value);
      }
    }

    for (element of $('script')) {
      value = element.src;
      if (shouldReplace(value)) {
        addElement(element.parentNode, 'script', {
          src: replace(value)
        });
        element.defer = true;
        element.src = '';
        element.remove();
      }
    }

    for (element of $('img')) {
      value = element.src;
      if (shouldReplace(value)) {
        // Used to cancel loading. Without this line it will remain pending status.
        element.src = '';
        element.src = replace(value);
      }
    }

    // All elements that have a style attribute
    for (element of $('*[style]')) {
      value = element.getAttribute('style');
      if (shouldReplace(value)) {
        element.setAttribute('style', replace(value));
      }
    }

    for (element of $('style')) {
      value = element.innerHTML;
      if (shouldReplace(value)) {
        element.innerHTML = replace(value);
      }
    }
  };

  const tryReplace = () => {
    if (!isRunning && failed && fastNode) {
      console.warn(SOURCE + ' is not available. Use ' + fastNode);
      isRunning = true;
      setTimeout(replaceElementSrc, 0);
      // Some need to wait for a while
      setTimeout(replaceElementSrc, 20);
      // Replace dynamically added elements
      setInterval(replaceElementSrc, 500);
    }
  };

  const checkAvailable = (url, callback) => {
    let timeoutId;
    const newNode = addElement(document.head, 'link', {
      rel: 'stylesheet',
      text: 'text/css',
      href: url + TEST_PATH + starTime
    });

    const handleResult = (isSuccess) => {
      if (!timeoutId) {
        return;
      }

      clearTimeout(timeoutId);
      timeoutId = 0;
      // Used to cancel loading. Without this line it will remain pending status.
      if (!isSuccess) newNode.href = 'data:text/css;base64,';
      newNode.remove();
      callback(isSuccess);
    };

    timeoutId = setTimeout(handleResult, TIMEOUT);

    newNode.addEventListener('error', () => handleResult(false));
    newNode.addEventListener('load', () => handleResult(true));
  };

  const cached = await (async () => {
    try {
      return Object.assign({}, await GM.getValue(STORE_KEY));
    } catch {
      return {};
    }
  })();

  const main = () => {
    cached.time = starTime;
    cached.failed = false;
    cached.fastNode = null;

    for (const url of DEST_LIST) {
      checkAvailable('https://' + url, (isAvailable) => {
        // console.log(url, Date.now() - starTime, Boolean(isAvailable));
        if (!isAvailable && url === SOURCE) {
          failed = true;
          cached.failed = true;
        }

        if (isAvailable && !fastNode) {
          fastNode = url;
        }

        if (isAvailable && !cached.fastNode) {
          cached.fastNode = url;
        }

        tryReplace();
      });
    }

    setTimeout(() => {
      // If all domains are timeout
      if (failed && !fastNode) {
        fastNode = DEST_LIST[1];
        tryReplace();
      }

      GM.setValue(STORE_KEY, cached);
    }, TIMEOUT + 100);
  };

  if (
    cached.time &&
    starTime - cached.time < 60 * 60 * 1000 &&
    cached.failed &&
    cached.fastNode
  ) {
    failed = true;
    fastNode = cached.fastNode;
    tryReplace();
    setTimeout(main, 1000);
  } else if (document.head) {
    main();
  } else {
    const observer = new MutationObserver(() => {
      if (document.head) {
        observer.disconnect();
        main();
      }
    });
    const observerOptions = {
      childList: true,
      subtree: true
    };
    observer.observe(document, observerOptions);
  }
})(document);
