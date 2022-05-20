(function (document) {
  const SOURCE = 'https://cdn.jsdelivr.net';
  const DEST = 'https://gcore.jsdelivr.net';
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
      newNode.href = 'about:blank';
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
      if (element.href && element.href.includes(SOURCE)) {
        element.href = element.href.replace(SOURCE, DEST);
      }
    }

    for (const element of $('script')) {
      if (element.src && element.src.includes(SOURCE)) {
        const newNode = document.createElement('script');
        newNode.src = element.src.replace(SOURCE, DEST);
        element.defer = true;
        element.src = '';
        element.before(newNode);
        element.remove();
      }
    }

    for (const element of $('img')) {
      if (element.src && element.src.includes(SOURCE)) {
        const source = element.src;
        // Used to cancel loading. Without this line it will remain pending status.
        element.src = '';
        element.src = source.replace(SOURCE, DEST);
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
