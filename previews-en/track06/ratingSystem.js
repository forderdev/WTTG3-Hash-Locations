let btnCollection = document.querySelectorAll("a.ratingBtn");
let ratingSystemP = document.getElementById("ratingSystem").getElementsByTagName("p");
let submit = false;

btnCollection.forEach(e => {
    e.addEventListener("click", function() { submitRating() });
});

function submitRating() {
    if (submit == false) {
        ratingSystemP[0].style = "display:block"
        submit = true;
        
    }
}
