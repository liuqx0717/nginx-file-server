var sortDesc = false;
var _path = "";
var _list = null;

function init() {
    path = normalizePath(getParameterByName("path"));
    $("#uploadbutton").attr("onClick", 'location.href="./upload.html?path=' + escapePathForURI(path) + '"');
    getFileList(path);
}

// download file list, call procFileList() and genHTMLFileList()
function getFileList(path) {
    url = "./files" + escapePathForURI(path);
    $.ajax({
        url: url,
        type: "GET",
        cache: false,
        dataType: "json",     // The type of data that you're expecting back from the server.
        success: function (response) {
            $("#status").remove();
            list = procFileList(response);
            sortFileList(list, "parsedDate", true);
            genHTMLFileList(list, path);
        },
        error: function(xhr, status, error) {
            errMsg = xhr.responseText;
            $("#status").html(errMsg);
            //window.location.replace(url);  // can't use the "back" button
        }
    }); 
}

// Generate file list and refresh #filelisttable
// @list: FILELIST
// @path: folder path
// @return: void
function genHTMLFileList(list, path) {
    _list = list;
    _path = path;
    $("#currentpath").text("Files in: " + path);
    var table = 
        '<thead>' +
        '  <tr>' +
        '    <th scope="col" style="white-space: nowrap;" onclick="clickSortName(_list, _path);">Name&nbsp;&nbsp;' + arrowDownUp + '</th>' +
        '    <th scope="col" style="white-space: nowrap;" onclick="clickSortDate(_list, _path);">Date&nbsp;&nbsp;' + arrowDownUp + '</th>' +
        '    <th scope="col">Size</th>' +
        '    <th><button type="button" class="close" aria-label="Refresh" onClick="getFileList(_path);">' + refreshIcon + '</button></th>' +
        '  </tr>' +
        '</thead>' +
        '<tbody>';
    var ppath = getParentPath(path);
    var plink = "./listdir.html?path=" + escapePathForURI(ppath);
    table += 
        '<tr>' +
        '  <td><a href="' + plink + '">' + '&lt;parent&gt;/' + '</td>' + 
        '  <td></td>' +
        '  <td></td>' +
        '  <td></td>' +
        '</tr>';

    var files = list.files;
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var name = file.name;
        if (file.dir) name += "/";
        var link = ".";
        var origlink = path + name;
        if (file.dir) {
            link += "/listdir.html?path=";
        }
        link += escapePathForURI(origlink);

        table += '<tr>';
        table += '<td><a href="' + escapeHtml(link) + '">' + escapeHtml(name) + '</td>';
        table += '<td>' + file.date + '</td>';
        table += '<td>' + file.size + '</td>';
        table += '<td>' + genDeleteButtonHTML(escapePathForURI(origlink), path)+ '</td>';
        table += '</tr>';
    }

    table += '</tbody>'
    $("#filelisttable").html(table);
}

// @path: folder path
function clickSortName(list, path) {
    sortFileList(list, "name", sortDesc);
    sortDesc = !sortDesc;
    genHTMLFileList(list, path);
}

// @path: folder path
function clickSortDate(list, path) {
    sortFileList(list, "parsedDate", sortDesc);
    sortDesc = !sortDesc;
    genHTMLFileList(list, path);
}

// @list: FILELIST
// @key: "name", "date"
// @desc: true, false (descending or not)
// @return: new FILELIST
function sortFileList(list, key, desc) {
    return list.files.sort(function(a, b){
        msba = a.dir ? 0 : 1;
        msbb = b.dir ? 0 : 1;
        if (desc) {
            return (msba < msbb) || (msba == msbb && a[key] > b[key]) ? -1 : 1;
        }
        else {
            return (msba < msbb) || (msba == msbb && a[key] < b[key]) ? -1 : 1;
        }
    });
}

// @url: file url
// @path: refresh the current page using @path when succeeds
// @return: html
function genDeleteButtonHTML(url, path) {
    _path = path;
    ret = 
        '<button type="button" class="close" aria-label="Delete" onclick="deleteFile(\'' + url + '\', _path)">' +
        trashBin +
        '</button>';
    return ret;
}

// @url: file url
// @path: current path (so it can refresh the current page if succeeds)
// @return: void
function deleteFile(url, path) {
    $.ajax({
        url: url,
        type: "DELETE",
        dataType: "text",     // The type of data that you're expecting back from the server.
        success: function (response) {
            //getFileList(path);
        },
        error: function(xhr, status, error) {
            //errMsg = xhr.responseText;
            //$("#status").html(errMsg);
        },
        complete: function(xhr, status){
            getFileList(path);
        }
    }); 
}

