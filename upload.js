var _path = "";
var _ppath = "";
var _folders = [];

function init() {
  path = "/" + getParameterByName("path").replace(/^\/+/, '').replace(/\/+$/, '');
  if (path != "/") path += "/"
  $("#destBox").val(path);
  getFileList(path);
}

// download file list html, call procHTMLFileList() and genHTMLFileList()
function getFileList(path) {
  url = "./files" + escapePathForURI(path);
  $.ajax({
    url: url,
    type: "GET",
    cache: false,
    dataType: "text",     // The type of data that you're expecting back from the server.
    success: function (response) {
      $("#status").remove();
      list = procHTMLFileList(response);
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
    $("#destBox").val(path);
    _path = path;
    var table = 
      '<thead>' +
      '  <tr>' +
      '    <th scope="col">Name</th>' +
      '    <th scope="col">Date</th>' +
      '    <th scope="col">Size</th>' +
      '    <th scope="col"><button type="button" class="close" aria-label="Refresh" onClick="getFileList(_path);">' + refreshIcon + '</button></th>' +
      '  </tr>' +
      '</thead>' +
      '<tbody>';
    var ppath = path;
    if (path != "/") ppath = path.replace(/[^\/]+\/$/, "");
    var plink = "./upload.html?path=" + escapePathForURI(ppath);
    _ppath = ppath;
    _folders = [];
    table += 
        '<tr>' +
        '  <td><a href="javascript:getFileList(_ppath)">' + '&lt;parent&gt;/' + '</td>' + 
        '  <td></td>' +
        '  <td></td>' +
        '  <td></td>' +
        '</tr>';

    var files = list.files;
    for (i = 0; i < files.length; i++) {
        var file = files[i];
        var isFolder = file.name.slice(-1) == "/";
        var link = ".";
        var origlink = path + file.name;
        if (isFolder) {
            link += "/upload.html?path=";
            _folders.push(origlink);
        }
        link += escapePathForURI(origlink);

        table += '<tr>';
        if (isFolder) {
            table += '<td><a href="javascript:getFileList(_folders[' + (_folders.length-1).toString() + '])">' + escapeHtml(file.name) + '</td>';
        }
        else {
            table += '<td><a href="' + link + '" target="_blank">' + escapeHtml(file.name) + '</td>';
        }
        table += '<td>' + file.date + '</td>';
        table += '<td>' + file.size + '</td>';
        table += '<td>' + genDeleteButtonHTML(escapePathForURI(origlink), path) + '</td>';
        table += '</tr>';
    }

    table += '</tbody>'
    $("#filelisttable").html(table);
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


function onSubmit(e){
  if(e != null) e.preventDefault();

  const selectedFiles = document.getElementById("fileBox").files;
  var N = selectedFiles.length;
  if (N == 0) return;

  var dest = $("#destBox").val();

  removeAlerts();
  $("#submitButton").attr("disabled", true);
  createProgressBar();

  uploadFile(selectedFiles, dest, 0, N, function(){
    removeProgressBar();
    $("#progressText").html("");
    $("#submitButton").attr("disabled", false);
    getFileList(_path);
  });
}

// Creating/removing progress bar should be handled outside of
// this function.
// i: the index of current file.
// N: the number of the files.
// onFinish: a function that should be executed after all the files
// are uploaded (either successfully or unsuccessfully). 
function uploadFile(files, dest, i, N, onFinish) {
  var file = files[i];
  var fileName = file.name;
  setProgressBar(0);
  $("#progressText").html(
    "<b>" + (i+1).toString() + " / " + N.toString() + "</b> - " + fileName
  );

  $.ajax({
    url: "./" + encodeURI(dest) + "/" + encodeURIComponent(fileName),
    type: "PUT",
    data: file,
    processData: false,   // by default (true), process 'data' if it is not a string.
    contentType: "binary/octet-stream", 
    // When sending data to the server, use this content type.
    // Note: The W3C XMLHttpRequest specification dictates that the charset is always
    // UTF-8; specifying another charset will not force the browser to change the 
    // encoding.
    dataType: "text",     // The type of data that you're expecting back from the server.
    success: function (response) {
      prependAlert("alert-success", "<b>Uploaded:</b> " + fileName);
    },
    error: function(xhr, status, error){
      errMsg = 
        "<b>Failed:</b> " + fileName + "<br>" +
        xhr.responseText.match(/<h1>(.*)<\/h1>/)[1] + "<br>" +
        //status + "<br>" +
        //error +
        "";
      prependAlert("alert-danger", errMsg);
    },
    complete: function(xhr, status){
      if(i == N-1) {
        onFinish();
      }
      else {
        uploadFile(files, dest, i+1, N, onFinish);
      }
    },
    xhr: function(){
      var xhr = new window.XMLHttpRequest();
      // Upload progress
      xhr.upload.addEventListener("progress", function(evt){
        if (evt.lengthComputable) {
          var percentComplete = Math.round(evt.loaded / evt.total * 100);
          //Do something with upload progress
          setProgressBar(percentComplete);
        }
      }, false);

      // Download progress
      //xhr.addEventListener("progress", function(evt){
      //  if (evt.lengthComputable) {
      //    var percentComplete = evt.loaded / evt.total;
      //    //Do something with download progress
      //    console.log(percentComplete);
      //  }
      //}, false);
      
      return xhr;
    }
  }); 

}


function createProgressBar() {
  newElement = 
    '<div class="progress">' +
      '<div id="progressBar" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%"></div>' +
    '</div>';

  $("#progressContainer").append(newElement);
}

// 0 <= p <= 100
function setProgressBar(p) {
  $("#progressBar").css({"width": p.toString() + "%"});
  $("#progressBar").attr("aria-valuenow", p.toString());
}

function removeProgressBar() {
  $("#progressContainer").empty();
}


function prependAlert(type, msg) {
  date = new Date();
  time = date.toLocaleTimeString();
  newElement = 
    "<div id='formAlert' class='alert " + type + "' role='alert'>" +
    time + "<br>" + msg +
    "</div>";
  $("#alertCol").prepend(newElement);
}

function removeAlerts() {
  $("#alertCol").empty();
}

