document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#captcha").src = `./img/verify${Math.floor(
    Math.random() * 3 + 1
  )}.png`;
});
function clearTextBox() {
  document.querySelector("#consentTextArea").value = "";
}