(function () {
  if (sessionStorage.getItem("r4r_auth") !== "1") {
    window.location.replace("index.html");
  }
})();
