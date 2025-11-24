
(function() {
  const parseStack = (err) => {
    if (!err?.stack) return { url: 'unknown', line: 0, col: 0 };

    for (const line of err.stack.split('\n')) {
      let m = line.match(/\((.*):(\d+):(\d+)\)$/) || 
              line.match(/at\s+(.*):(\d+):(\d+)/);
      if (m) return { url: m[1], line: m[2], col: m[3] };
    }
    return { url: 'unknown', line: 0, col: 0 };
  };

  const showError = (message, detail, err) => {
    const { url, line, col } = parseStack(err);
    let fileName = url;

    try {
      const path = new URL(url).pathname.split('/');
      fileName = path.slice(-3).join('/');
    } catch {}

    console.log(`%c ${err} `, 'background:#fff;color:#c0392b;font-weight:bold;');
    console.groupCollapsed('%c Detail', 'color:#e74c3c; cursor:pointer;');
    console.log('%cFile     : %c' + fileName, 'font-weight:bold;', 'color:#3498db;');
    console.log('%cLine     : %c' + line + ':' + col, 'font-weight:bold;', 'color:#e67e22;');
    console.log('%cMessage  : %c' + message, 'font-weight:bold;', 'color:#e74c3c;');

    if (err?.stack) {
      console.log('%cStack Trace:', 'font-weight:bold;');
      console.log(err.stack);
    }
    console.groupEnd();
  };

  window.onerror = (msg, url, line, col, error) => {
    showError(msg, url, error ?? new Error(msg));
    return false;
  };

  window.onunhandledrejection = (ev) => {
    const error = ev.reason instanceof Error ? ev.reason : new Error(ev.reason);
    showError('UNHANDLED PROMISE REJECTION', ev.reason, error);
  };
})();

const log = (...args) => console.log(...args)

const logJ = (...args) => console.log(JSON.stringify(...args, null, 2));

eruda.init();