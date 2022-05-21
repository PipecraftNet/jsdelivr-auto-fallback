(function (document) {
  const SOURCE = '//cdn.jsdelivr.net';
  const DEST = '//gcore.jsdelivr.net';
  const replace = (text) => text.replace(SOURCE, DEST);
  const shouldReplace = (text) => text && text.includes(SOURCE);
  const $ = document.querySelectorAll.bind(document);
  const checkAvailable = (callback) => {
    let timeoutId;
    const newNode = document.createElement('link');
    newNode.rel = 'stylesheet';
    newNode.text = 'text/css';
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

    timeoutId = setTimeout(handleResult, 2000);
    newNode.addEventListener('error', handleResult);
    newNode.addEventListener('load', () => handleResult(true));

    newNode.href =
      SOURCE +
      '/gh/PipecraftNet/jsdelivr-auto-fallback@main/empty.css?' +
      Date.now();
    document.head.insertAdjacentElement('afterbegin', newNode);
  };

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

  checkAvailable(function (isAvailable) {
    if (isAvailable) {
      return;
    }

    console.warn(SOURCE + ' is not available.');

    replaceElementSrc();
    // Replace dynamically added elements
    setInterval(replaceElementSrc, 500);
  });
})(document);
