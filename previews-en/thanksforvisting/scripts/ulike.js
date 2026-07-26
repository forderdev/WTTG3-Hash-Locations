function process(over) {
    const yes = document.getElementById("yes");
    const no = document.getElementById("no");

    const noSrc = "img/no.png";
    const yesSrc = "img/yes.png";
    if (over) {
        no.src = yesSrc;
        yes.src = noSrc;
    } else {
        no.src = noSrc;
        yes.src = yesSrc;
    }
}