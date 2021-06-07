$(document).ready(function() {
  var path = normalizePath(getParameterByName("path"));
  var fileList = createFileList("fileList");
  fileList.newPage = true;
  fileList.inPlaceUpdate = true;
  fileList.allowCustomSorting = false;
  fileList.setShownCb(_fileListShownCb);
  fileList.loadAndShow(path);
});


function _fileListShownCb(fileList) {
  $("#destBox").val(fileList.getDirPath());
}


function onSubmit(e){
  if(e != null) e.preventDefault();

  const selectedFiles = document.getElementById("fileBox").files;
  var N = selectedFiles.length;
  if (N == 0) return;

  var dest = normalizePath($("#destBox").val() + "/");

  removeAlerts();
  $("#submitButton").attr("disabled", true);
  createProgressBar();

  uploadFile(selectedFiles, dest, 0, N, function(){
    removeProgressBar();
    $("#progressText").html("");
    $("#submitButton").attr("disabled", false);
    getFileList("fileList").loadAndShow();
  });
}


/*
 * Creating/removing progress bar should be handled outside of
 * this function.
 * dest: normalized folder path
 * i: the index of current file.
 * N: the number of the files.
 * onFinish: a function that should be executed after all the files
 * are uploaded (either successfully or unsuccessfully).
 */
function uploadFile(files, dest, i, N, onFinish) {
  var file = files[i];
  var fileName = file.name;
  setProgressBar(0);
  $("#progressText").html(
    "<b>" + (i+1).toString() + " / " + N.toString() + "</b> - " +
    escapeHtml(fileName)
  );

  $.ajax({
    url: "./" + escapePathForURI(dest) + escapePathForURI(fileName),
    type: "PUT",
    data: file,
    // by default (true), process 'data' if it is not a string.
    processData: false,
    /*
     * When sending data to the server, use this content type.
     * Note: The W3C XMLHttpRequest specification dictates that the charset
     * is always UTF-8; specifying another charset will have no effect.
     */
    contentType: "binary/octet-stream",
    // The type of data that you're expecting back from the server.
    dataType: "text",
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
      } else {
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
    '  <div id="progressBar"' +
    '       class="progress-bar progress-bar-striped progress-bar-animated"' +
    '       role="progressbar" aria-valuenow="0" aria-valuemin="0"' +
    '       aria-valuemax="100" style="width: 0%">' +
    '  </div>' +
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
