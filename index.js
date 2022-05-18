(function () {
  const SOURCE = 'https://cdn.jsdelivr.net';
  const DEST = 'https://gcore.jsdelivr.net';
  const $ = document.querySelectorAll.bind(document);
  const checkAvailable = (callback) => {
    const img = new Image();
    const timeoutId = setTimeout(function () {
      callback(false);
    }, 3000);
    img.addEventListener('load', function () {
      clearTimeout(timeoutId);
      callback(true);
    });

    img.src = SOURCE + '/favicon.ico';
  };

  const replaceImageSrc = () => {
    for (const element of $('img')) {
      if (element.src && element.src.includes(SOURCE)) {
        element.src = element.src.replace(SOURCE, DEST);
      }
    }

    for (const element of $('link[rel="stylesheet"]')) {
      if (element.href && element.href.includes(SOURCE)) {
        element.href = element.href.replace(SOURCE, DEST);
      }
    }

    for (const element of $('script')) {
      if (element.src && element.src.includes(SOURCE)) {
        const newNode = document.createElement('script');
        newNode.src = element.src.replace(SOURCE, DEST);
        element.after(newNode);
        element.remove();
      }
    }
  };

  checkAvailable(function (isAvailable) {
    if (isAvailable) {
      return;
    }

    console.warn(SOURCE + ' is not available.');

    replaceImageSrc();
    // Replace dynamically added elements
    setInterval(replaceImageSrc, 2000);
  });
})();
