/*
 * Usage:
 *   Create element in html:
 *     <div id="fileList1"></div>
 *   Create FileList object in javascript:
 *     createFileList("fileList1")
 *   Get FileList object by id:
 *     getFileList("fileList1")
 *
 * File object:
 * {
 *   name: "someFile",
 *   isDir: false,
 *   date: "Tue, 28 Jan 2020 02:00:00 GMT",
 *   parsedDate: 123456,
 *   size: "86K"
 * }
 * {
 *   name: "someFolder/",
 *   isDir: true,
 *   date: "Tue, 28 Jan 2020 02:00:00 GMT",
 *   parsedDate: 123456,
 *   size: "-"
 * }
 *
 * FileList object:
 * {
 *   showFiles: true,
 *   showDirs: true,
 *   sortKey: "parsedDate",
 *   sortDesc: true,
 *   allowCustomSorting: true,
 *   newPage: false,
 *   inPlaceUpdate: false,
 *   files: [File objects],
 *   getId: function(),
 *   getDirPath: function(),
 *   setShownCb: function(cb),
 *   loadAndShow: function(path),
 * }
 */


var _fileListIdToObj = {};


/*
 * @id: Element id to bind (typically a <div>), the DOM Node with id @id
 *   must exist.
 * @return: FileList object.
 *
 */
function createFileList(id) {
  var jqObj = $("#" + id);
  var fileList = {
    showFiles: true,
    showDirs: true,
    sortKey: "parsedDate",
    sortDesc: true,
    // Whether a user can change the sorting by clicking the column header.
    allowCustomSorting: true,
    // Open a new page when clicking a file.
    newPage: false,
    // Don't enter a new page when clicking a folder.
    inPlaceUpdate: false,
    files: [],
    _id: id,
    _dirPath: "",
    _jqObj: jqObj,
    _error: null,   // html string
    _shownCb: function(fileList) {},

    // @return: string.
    getId: function() {
      return this._id;
    },

    // @return: string.
    getDirPath: function() {
      return this._dirPath;
    },

    // @cb: function(fileList).
    setShownCb: function(cb) {
      this._shownCb = cb;
    },

    /*
     * Download, sort and show file list.
     * @path: normalized path. If not specified, use this._dirPath.
     */
    loadAndShow: function(path) {
      if (path == null) {
        path = this._dirPath;
      }
      var id = this._id;
      var url = "./files" + escapePathForURI(path);

      $.ajax({
        url: url,
        type: "GET",
        cache: false,
        // The type of data that you're expecting back from the server.
        dataType: "json",
        success: function(response) {
          fileList._error = null;
          fileList._load(response, path);
          fileList._sort();
        },
        error: function(xhr, status, error) {
          fileList._error = xhr.responseText;
        },
        complete: function() {
          fileList._show();
        }
      });
    },

    _sort: function() {
      this.files.sort(function(a, b) {
        var msba = a.isDir ? 0 : 1;
        var msbb = b.isDir ? 0 : 1;
        if (fileList.sortDesc) {
          return (msba < msbb) ||
                 (msba == msbb && a[fileList.sortKey] > b[fileList.sortKey]) ?
                 -1 : 1;
        }
        else {
          return (msba < msbb) ||
                 (msba == msbb && a[fileList.sortKey] < b[fileList.sortKey]) ?
                 -1 : 1;
        }
      });
    },

    // Display the file list.
    _show: function() {
      this._jqObj.html(this._error == null ?
                       this._genTableHtml() :
                       this._error);
      this._shownCb(this);
    },

    /*
     * Convert and save an nginx file list to this.files.
     * @list: the JSON returned by nginx autoindex.
     * @dirPath: normalized dir path of the current file list.
     */
    _load: function(list, dirPath) {
      this._dirPath = dirPath;
      this.files = [];
      for (var i = 0; i < list.length; i++) {
        var isDir = list[i].type == "directory";
        if (isDir && !this.showDirs || !isDir && !this.showFiles) {
          continue;
        }
        this.files.push({
          name: list[i].name + (isDir ? "/" : ""),
          isDir: isDir,
          date: (new Date(list[i].mtime)).toLocaleString(),
          parsedDate: Date.parse(list[i].mtime),
          size: isDir ? "-" : humanFileSize(list[i].size)
        });
      }
    },

    /*
     * Generate the link for a file/folder.
     * @path: normalized path (folders must have a trailing slash).
     * @return: html string, which should be placed inside <a> node.
     */
    _genLinkHtml: function(path) {
      var link = 'href=';
      if (path.slice(-1) == "/") {
        // folder
        if (this.inPlaceUpdate) {
          link += '"javascript:getFileList(\'' + this._id +'\')' +
                  '.loadAndShow(\'' + escapeHtml(path).replace(/'/g, "\\'") + '\')"';
        } else {
          link += '"./listdir.html?path=' + escapePathForURI(path) + '"';
        }
      } else {
        // file
        link += '".' + escapePathForURI(path) + '"';
        if (this.newPage) {
          link += ' target="_blank"';
        }
      }
      return link;
    },

    // @return: html string of the file list table.
    _genTableHtml: function() {
      var pPath = getParentPath(this._dirPath);

      var html =
        '<table class="table">' +
        '  <thead>' +
        '    <tr>' +
        '      <th class="file-list-name" scope="col"' +
        '          style="white-space: nowrap;">' +
        '        Name' +
                 (this.allowCustomSorting ? '&nbsp;&nbsp;' + arrowDownUp : '') +
        '      </th>' +
        '      <th class="file-list-date d-none d-md-table-cell" scope="col"' +
        '          style="white-space: nowrap;">' +
        '        Date' +
                 (this.allowCustomSorting ? '&nbsp;&nbsp;' + arrowDownUp : '') +
        '      </th>' +
        '      <th scope="col">Size</th>' +
        '      <th>' +
        '        <button class="file-list-refresh close" type="button"' +
        '                aria-label="Refresh">' +
                   refreshIcon +
        '        </button>' +
        '      </th>' +
        '    </tr>' +
        '  </thead>' +
        '  <tbody>';

      if (this.showDirs) {
        html +=
          '<tr>' +
          '  <td>' +
          '    <a ' + this._genLinkHtml(pPath) + '>' +
          '      &lt;parent&gt;/' +
          '    </a>' +
          '  </td>' +
          '  <td></td>' +
          '  <td></td>' +
          '  <td></td>' +
          '</tr>';
      }

      for (var i = 0; i < this.files.length; i++) {
        var file = this.files[i];
        var name = file.name;
        var path = this._dirPath + name;

        html +=
          '<tr>' +
          '  <td>' +
          '    <a ' + this._genLinkHtml(path) + '>' +
                 escapeHtml(name) +
          '    </a>' +
          '  </td>' +
          '  <td class="small d-none d-md-table-cell">' + file.date + '</td>' +
          '  <td class="small">' + file.size + '</td>' +
          '  <td>' +
          '    <button class="file-list-delete close" type="button"' +
          '            aria-label="Delete"' +
          '            data-path="' + escapeHtml(path) + '">' +
                 trashBin +
          '    </button>' +
          '  </td>' +
          '</tr>';
      }

      html +=
        '  </tbody>' +
        '</table>';

      return html;
    }
  };

  jqObj.on("click", ".file-list-name", function(event) {
    if (fileList.allowCustomSorting) {
      fileList.sortKey = "name";
      fileList.sortDesc = !fileList.sortDesc;
      fileList._sort();
      fileList._show();
    }
  });

  jqObj.on("click", ".file-list-date", function(event) {
    if (fileList.allowCustomSorting) {
      fileList.sortKey = "parsedDate";
      fileList.sortDesc = !fileList.sortDesc;
      fileList._sort();
      fileList._show();
    }
  });

  jqObj.on("click", ".file-list-refresh", function(event) {
    fileList.loadAndShow();
  });

  jqObj.on("click", ".file-list-delete", function(event) {
    var deleteButton = getElementOnEventPathByClass(event.originalEvent,
                                                    "file-list-delete");
    if (deleteButton == null) {
      return;
    }

    // Read "data-path" attribute.
    var path = deleteButton.dataset.path;

    $.ajax({
      url: escapePathForURI(path),
      type: "DELETE",
      // The type of data that you're expecting back from the server.
      dataType: "text",
      success: function (response) {
      },
      error: function(xhr, status, error) {
      },
      complete: function(xhr, status){
        fileList.loadAndShow();
      }
    });
  });

  _fileListIdToObj[id] = fileList;
  return fileList;
}


/*
 * Get FileList object by id.
 * @id: string.
 * @return: FileList object.
 */
function getFileList(id) {
  return _fileListIdToObj[id];
}
