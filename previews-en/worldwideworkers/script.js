        
window.onload = function() {
    var reloading = sessionStorage.getItem("reloading");
    if (reloading) {
        sessionStorage.removeItem("reloading");
        document.getElementById("paymentFailedText").style.display = "block";
    }else{
        document.getElementById("paymentFailedText").style.display = "none";
    }
}

function submitPayment() {
    document.getElementById("paymentFailedText").style.display = "block";
}