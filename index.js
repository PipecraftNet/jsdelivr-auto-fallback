(function (document) {
  const SOURCE = 'https://cdn.jsdelivr.net';
  const DEST = 'https://gcore.jsdelivr.net';
  const replace = (text) => text.replace(SOURCE, DEST);
  const shouldReplace = (text) => text && text.includes(SOURCE);
  const $ = document.querySelectorAll.bind(document);
  const checkAvailable = (callback) => {
    let timeoutId;
    const newNode = document.createElement('link');
    newNode.rel = 'stylesheet';
    newNode.text = 'text/css';
    const onError = () => {
      if (!timeoutId) {
        return;
      }

      clearTimeout(timeoutId);
      timeoutId = 0;
      newNode.href = 'data:text/plain;base64,';
      newNode.remove();
      callback(false);
    };

    timeoutId = setTimeout(onError, 2000);
    newNode.addEventListener('error', onError);
    newNode.addEventListener('load', function () {
      newNode.remove();
      clearTimeout(timeoutId);
      callback(true);
    });

    newNode.href =
      SOURCE +
      '/gh/PipecraftNet/jsdelivr-auto-fallback@main/empty.css?' +
      Date.now();
    document.head.insertAdjacentElement('afterbegin', newNode);
  };

  const replaceElementSrc = () => {
    for (const element of $('link[rel="stylesheet"]')) {
      if (shouldReplace(element.href)) {
        element.href = replace(element.href);
      }
    }

    for (const element of $('script')) {
      if (shouldReplace(element.src)) {
        const newNode = document.createElement('script');
        newNode.src = replace(element.src);
        element.defer = true;
        element.src = '';
        element.before(newNode);
        element.remove();
      }
    }

    for (const element of $('img')) {
      if (shouldReplace(element.src)) {
        const source = element.src;
        // Used to cancel loading. Without this line it will remain pending status.
        element.src = '';
        element.src = replace(source);
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
