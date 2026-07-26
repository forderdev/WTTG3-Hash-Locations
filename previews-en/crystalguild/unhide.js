function unhide() { 
    var x = document.getElementById("prompt");
    var y = document.getElementById("submit");
    x.style.display = "block";
    y.style.display = "none";
    window.scrollTo(0, document.body.scrollHeight);
  }