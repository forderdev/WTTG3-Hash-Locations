class reflectVideoplayer extends HTMLElement {
    
    static get observedAttributes() {
        return ['src', 'external-sound', 'icon'];
    }

    constructor() {
        super();
    }

    connectedCallback() {
        const attrSource = this.getAttribute('src');
        let attrIconColor = this.getAttribute('icon');
        const attrSound = this.getAttribute('external-sound');
        const videoplayer = document.createElement("video");
        const playbutton = document.createElement("a");

        if (attrIconColor == null) attrIconColor == "black";

        videoplayer.src = attrSource;
        videoplayer.style = "height: inherit; width: inherit;"
        videoplayer.muted = true;
        videoplayer.defaultMuted = true;
        videoplayer.playsInline = true;
        videoplayer.disablePictureInPicture = true;

        videoplayer.addEventListener("ended", function() {
            playbutton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="60px" height="60px" fill="inherit" stroke="inherit"><defs><style>.cls-1{fill: none;stroke-width: 50px;}.cls-2{stroke-linecap: round;stroke-linejoin: round;stroke-width: 29.24px;fill-rule: evenodd;}</style></defs><circle class="cls-1" cx="250" cy="250" r="217.625"></circle> <path class="cls-2" d="M208.975,307.987l116.2-57.98-116.2-57.98v115.96Z"></path></svg>';
            playbutton.style.visibility = 'visible';
        })

        this.addEventListener("mouseover", function() {
            if (!videoplayer.paused) {
                playbutton.style.visibility = 'visible';
            }
        });

        this.addEventListener("mouseout", function() {
            if (!videoplayer.paused) {
                playbutton.style.visibility = 'hidden';
            }
        });
        
        playbutton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="60px" height="60px" fill="inherit" stroke="inherit"><defs><style>.cls-1{fill: none;stroke-width: 50px;}.cls-2{stroke-linecap: round;stroke-linejoin: round;stroke-width: 29.24px;fill-rule: evenodd;}</style></defs><circle class="cls-1" cx="250" cy="250" r="217.625"></circle> <path class="cls-2" d="M208.975,307.987l116.2-57.98-116.2-57.98v115.96Z"></path></svg>';
        playbutton.style = 'position: absolute;transform: translate(-50%, -50%);top: 50%;left: 50%; transition: visibility 0s, .5s ease-in-out; fill:' + attrIconColor + '; stroke:' + attrIconColor + ';';
        playbutton.addEventListener("click", function() {
            if (videoplayer.currentTime > 0 && !videoplayer.paused) {
                videoplayer.pause();
                sendEventToUnreal("PauseAudio", {});
                playbutton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="60px" height="60px" fill="inherit" stroke="inherit"><defs><style>.cls-1{fill: none;stroke-width: 50px;}.cls-2{stroke-linecap: round;stroke-linejoin: round;stroke-width: 29.24px;fill-rule: evenodd;}</style></defs><circle class="cls-1" cx="250" cy="250" r="217.625"></circle> <path class="cls-2" d="M208.975,307.987l116.2-57.98-116.2-57.98v115.96Z"></path></svg>';
            } else {
                videoplayer.play();
                sendEventToUnreal("PlayAudio", {});
                playbutton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="60px" height="60px" fill="inherit" stroke="inherit"><defs><style>.cls-1{fill: none;stroke-width: 50px;}.cls-2{stroke-linecap: round;stroke-linejoin: round;stroke-width: 10px;fill-rule: evenodd;}</style></defs><circle class="cls-1" cx="250" cy="250" r="217.625"></circle> <path class="cls-2" d="M170.606,165.974h67.929V335.026H170.606V165.974Z"/><path class="cls-2" d="M262.465,165.974h67.929V335.026H262.465V165.974Z"/></svg>';
            }
        });

        playbutton.addEventListener("mouseover", function() {
            playbutton.style.opacity = ".8";
            playbutton.style.transform = "translate(-50%, -50%) scale(1.2)";
        });

        playbutton.addEventListener("mouseout", function() {
            playbutton.style.opacity = "";
            playbutton.style.transform = "translate(-50%, -50%)";
        });

        this.append(videoplayer);
        this.append(playbutton);
    }

}

customElements.define('reflect-videoplayer', reflectVideoplayer);