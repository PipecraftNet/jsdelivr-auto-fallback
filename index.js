((document) => {
  'use strict';
  const DEST_LIST = [
    'cdn.jsdelivr.net',
    'fastly.jsdelivr.net',
    'gcore.jsdelivr.net',
    'testingcf.jsdelivr.net',
    'test1.jsdelivr.net'
  ];
  const PREFIX = '//';
  const SOURCE = DEST_LIST[0];
  // const starTime = Date.now();
  const shouldReplace = (text) => text && text.includes(PREFIX + SOURCE);
  const replace = (text) => text.replace(PREFIX + SOURCE, PREFIX + fastNode);
  const $ = document.querySelectorAll.bind(document);

  const replaceElementSrc = () => {
    let element;
    let value;
    for (element of $('link[rel="stylesheet"]')) {
      value = element.href;
      if (shouldReplace(value)) {
        element.href = replace(value);
      }
    }

    for (element of $('script')) {
      value = element.src;
      if (shouldReplace(value)) {
        const newNode = document.createElement('script');
        newNode.src = replace(value);
        element.defer = true;
        element.src = '';
        element.before(newNode);
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
    if (failed && fastNode) {
      console.warn(SOURCE + ' is not available. Use ' + fastNode);
      failed = false;

      replaceElementSrc();
      // Replace dynamically added elements
      setInterval(replaceElementSrc, 500);
    }
  };

  const checkAvailable = (url, callback) => {
    let timeoutId;
    const newNode = document.createElement('link');
    const handleResult = (isSuccess) => {
      if (!timeoutId) {
        return;
      }

      clearTimeout(timeoutId);
      timeoutId = 0;
      // Used to cancel loading. Without this line it will remain pending status.
      if (!isSuccess) newNode.href = 'data:text/plain;base64,';
      newNode.remove();
      callback(isSuccess);
    };

    timeoutId = setTimeout(handleResult, 1000);

    newNode.addEventListener('error', () => handleResult(false));
    newNode.addEventListener('load', () => handleResult(true));
    newNode.rel = 'stylesheet';
    newNode.text = 'text/css';
    newNode.href =
      url +
      '/gh/PipecraftNet/jsdelivr-auto-fallback@main/empty.css?' +
      Date.now();
    document.head.insertAdjacentElement('afterbegin', newNode);
  };

  let fastNode;
  let failed;

  for (const url of DEST_LIST) {
    checkAvailable('https://' + url, (isAvailable) => {
      // console.log(url, Date.now() - starTime, Boolean(isAvailable));
      if (!isAvailable && url === SOURCE) {
        failed = true;
      }

      if (isAvailable && !fastNode) {
        fastNode = url;
      }

      tryReplace();
    });
  }

  // If all domains are timeout
  setTimeout(() => {
    if (failed && !fastNode) {
      fastNode = DEST_LIST[1];
      tryReplace();
    }
  }, 1100);
})(document);
