function ValidatePayment() {
    const btn = document.getElementById("validate-btn");

    btn.classList.remove("cursor-pointer");
    btn.classList.add("cursor-none");
    btn.src= "img/validateLogStatus.gif";

}