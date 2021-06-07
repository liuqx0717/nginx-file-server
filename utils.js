const arrowDownUp =
  '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-down-up" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5zm-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5z"/></svg>';

const trashBin =
  '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-trash" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>';

const refreshIcon =
  '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-clockwise" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/></svg>';


/*
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
function humanFileSize(bytes, si, dp) {
  // Work around IE (it doesn't support default value!)
  if (si == null) {
    si = false;
  }
  if (dp == null) {
    dp = 1;
  }
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si ?
                ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] :
                ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  let r = Math.pow(10, dp);

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return bytes.toFixed(dp) + ' ' + units[u];
}


function getParameterByName(name, url) {
  if (url == null) {
    url = window.location.href;
  }
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  var results = regex.exec(url);
  if (!results) {
    return null;
  }
  if (!results[2]) {
    return '';
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


/*
 * @unsafe: string.
 * @return: html string.
 * Note: in html, special characters (< > & ") are not allowed even if
 * they are quoted, like this one: onclick="func(1 < 2)".
 */
function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;");
}


/*
 * encodeURIComponent() escapes all characters except the following:
 *     alphabetic, decimal digits, - _ . ! ~ * ' ( )
 * This function escapes ! ' ( ) * as well.
 */
function escapePathForURI(path) {
  var ret = ""
  var curr = ""
  for (var i = 0; i < path.length; i++) {
    if (path[i] == "/") {
      ret += encodeURIComponent(curr) + "/";
      curr = "";
    } else {
      curr += path[i];
    }
  }
  ret += encodeURIComponent(curr);
  return ret.replace(/[!'()*]/g, escape);
}


// Remove redundant leading/trailing slashes.
function normalizePath(path) {
  var ret = "/" + path.replace(/^\/+/, '').replace(/\/+$/, '');
  if (ret != "/") {
    ret += "/";
  }
  return ret;
}


// @path: normalized path.
function getParentPath(path) {
  return path != "/" ? path.replace(/[^\/]+\/?$/, "") : path;
}


/*
 * Check if a class is assigned to an element.
 * @node: HTML DOM Node object.
 * @className: string.
 * @return: bool.
 */
function hasClass(node, className) {
  var classList = node.className.split(/\s+/);
  for (var i = 0; i < classList.length; i++) {
    if (classList[i] == className) {
      return true;
    }
  }
  return false;
}


/*
 * Get a specific element on the event path by class name.
 * @event: HTML DOM Event object (not jQuery event).
 * @className: string.
 * return: DOM Node object, or null.
 */
function getElementOnEventPathByClass(event, className) {
  if (event.composedPath) {
    var eventPath = event.composedPath();
    for (var i = 0; i < eventPath.length; i++) {
      var node = eventPath[i];
      if (typeof node.className != "string") {
        // For svg elements, the className is an SVGAnimatedString.
        continue;
      }
      if (hasClass(node, className)) {
        return node;
      }
    }
  } else {
    // IE doesn't support event.composedPath().
    for (var node = event.target; node != document; node = node.parentNode) {
      if (hasClass(node, className)) {
        return node;
      }
    }
  }

  return null;
}
