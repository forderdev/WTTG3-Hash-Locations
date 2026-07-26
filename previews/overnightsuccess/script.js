document.addEventListener("DOMContentLoaded", function () {
    const image = document.getElementById("clickable-image");
    const hiddenText = document.getElementById("hidden-text");

    if (image && hiddenText) {
        image.addEventListener("click", function () {
            hiddenText.style.visibility ="visible"
        });
    }
});
