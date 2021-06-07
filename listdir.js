$(document).ready(function() {
  var path = normalizePath(getParameterByName("path"));
  $("#uploadButton").attr("onClick",
                          'location.href="./upload.html?path=' +
                          escapePathForURI(path) + '"');
  var fileList = createFileList("fileList");
  fileList.setShownCb(_fileListShownCb);
  fileList.loadAndShow(path);
});


function _fileListShownCb(fileList) {
  $("#currentPath").text("Files in: " + fileList.getDirPath());
}
