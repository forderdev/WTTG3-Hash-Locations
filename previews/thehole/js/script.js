var currentVid = document.getElementById('watch');
var collection = [
    "img/breathe.webm", 
    "img/pump.webm",
    "img/heart.webm"
];

var sfx = [
    "Breathe",
    "Pump",
    "Heart"
];

function PlayVideo(VideoIndex){
    currentVid.src = collection[VideoIndex];
    currentVid.play();

    if(currentVid.src.includes("img/breathe.webm")){
        return;
    }

    document.getElementById("overlay").setAttribute("hidden", "");
}

function ZoomClick(){
    document.getElementById("watch").setAttribute("src", "img/ZOOM.webm");
    document.getElementById("watch").removeAttribute("loop");
    document.getElementById("overlay").setAttribute("hidden", "");
    sendEventToUnreal("PlaySFX", { SFX: 'Zoom'});
}