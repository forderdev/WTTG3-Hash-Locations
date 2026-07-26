function process(over) {
    const yes = document.getElementById("yes");
    const no = document.getElementById("no");

    if (over) {
        no.textContent = "EVET";
        yes.textContent = "HAYIR";
        no.classList.remove("response-no");
        no.classList.add("response-yes");
        yes.classList.remove("response-yes");
        yes.classList.add("response-no");
    } else {
        no.textContent = "HAYIR";
        yes.textContent = "EVET";
        no.classList.remove("response-yes");
        no.classList.add("response-no");
        yes.classList.remove("response-no");
        yes.classList.add("response-yes");
    }
}
