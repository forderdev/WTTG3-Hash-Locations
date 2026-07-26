function errorMSG(){
    const errorLabel = "There was an issue processing your payment please try again.";
    const buyLabel1 = document.getElementById("buyLabel1");
    const buyLabel2 = document.getElementById("buyLabel2");

    buyLabel1.classList.add("textBold");
    buyLabel1.innerHTML = errorLabel;
    buyLabel2.style.visibility = "hidden";
}