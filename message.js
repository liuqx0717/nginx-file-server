$(document).ready(function() {
  $('#messageForm').keydown(function(event) {
    if (event.ctrlKey && event.keyCode === 13) {
      $(this).trigger('submit');
    }
  });

  $('[data-toggle="tooltip"]').tooltip();

  pullMessage();
});


function pushMessage(e=null) {
  if(e != null) e.preventDefault();

  msg = $("#messageText").val();

  $.ajax({
    url: "./tmp/.tmp.txt",
    type: "PUT",
    data: msg,
    // by default (true), process 'data' if it is not a string.
    processData: false,
    /*
     * When sending data to the server, use this content type.
     * Note: The W3C XMLHttpRequest specification dictates that the charset
     * is always UTF-8; specifying another charset will have no effect.
     */
    contentType: "text/plain",
    // The type of data that you're expecting back from the server.
    dataType: "text",
    success: function (response) {
      showAlert("alert-success", "Successfully pushed the message.");
      $("#messageText").val("");
    },
    error: function(xhr, status, error){
      errMsg =
        //"Failed.<br>" +
        xhr.responseText.match(/<h1>(.*)<\/h1>/)[1] + "<br>" +
        //status + "<br>" +
        //error +
        "";
      showAlert("alert-danger", errMsg);
    }
  });
}


function pullMessage() {
  $.ajax({
    url: "./tmp/.tmp.txt",
    type: "GET",
    cache: false,
    // The type of data that you're expecting back from the server.
    dataType: "text",
    success: function (response) {
      $("#messageText").val(response);
      showAlert("alert-success", "Successfully pulled the message.");
    },
    error: function(xhr, status, error){
      errMsg =
        //"Failed.<br>" +
        xhr.responseText.match(/<h1>(.*)<\/h1>/)[1] + "<br>" +
        //status + "<br>" +
        //error +
        "";
      showAlert("alert-danger", errMsg);
    }
  });
}


function showAlert(type, msg) {
  $("#formAlert").remove();

  date = new Date();
  time = date.toLocaleTimeString();
  newElement =
    "<div id='formAlert' class='alert " + type + "' role='alert'>" +
      time + "<br>" + msg +
    "</div>";
  $("#alertCol").append(newElement);

}
