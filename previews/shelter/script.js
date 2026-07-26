function minutesRemain() {
  let minutes = 3560 + (80 - Math.floor(Math.random() * 190));
  let numberString = minutes.toString();
  let formattedNumber =
    numberString.slice(0, 1) + "," + numberString.slice(1);
  document.getElementById("minutes").innerHTML = formattedNumber;
}

function watchRecent() {
  document.getElementById("play").setAttribute("src", "img/loading.gif");
  document.getElementsByClassName("btnPlay")[0].removeAttribute("onclick");
  document.getElementsByClassName("btnPlay")[0].style.cursor = "auto";
}

function minutesCheck() {
  let minutes = 3560 + (80 - Math.floor(Math.random() * 190));
  let numberString = minutes.toString();
  let formattedNumber =
    numberString.slice(0, 1) + "," + numberString.slice(1);
  document.getElementById("minutesLeft").innerHTML = formattedNumber;
}

function handleClick(index) {
  const buttons = document.querySelectorAll(".segmented-button");

  buttons.forEach((button, i) => {
    button.classList.remove("active");
    if (index === i + 1) {
      button.classList.add("active");
    }
  });
}

// Removed this function from donate.html buttons after Adam asked for all JS simulated reloads
// to be handled by regular link clicks. This code can be shown in the faked in-game source code
// Bill
function processPayment() {
  location.reload();
}

function playVideo(id) {
  document.getElementById("videoTitle").innerHTML = id + "_event.webm";
}

function accessCheck(event) {
  // Check if the key pressed is Enter (key code 13)
  if (event.keyCode === 13) {
    // Clear the input field
    document.getElementById("inputAccessCode").value = "";
  }
}

const option = document.getElementsByClassName("option");
const inputs = document.getElementsByTagName("input");
let choice = 0;
let optionSelection = [];

// Checks for selection first, if none adds a active class which shows a dot inside the circle
// If a selection has been made it adds that selection id to an array and then on click of a different
// selection it dumps the array and then adds the new selection id
// onclick of a non input field it clears the value inside and re-disables the input field

for (var i = 0; i < option.length; i++) {
  option[i].addEventListener("click", function() {
    if (choice === 0 && this.className != "option active" && this.value <= 4) {
        optionSelection.push(event.target.id);
        this.className += " active";
        choice = 1;

      } else if (choice === 0 && this.className != "option active") {
          optionSelection.push(event.target.id);
          this.className += " active";
          document.getElementById("other").removeAttribute("disabled");
          choice = 1;

      } else if (choice > 0 && this.value <= 4){
          document.getElementById(optionSelection[0]).setAttribute("class", "option");
          optionSelection = [];
          this.className += " active";
          optionSelection.push(event.target.id);
          document.getElementById("other").setAttribute("disabled", "");
          document.getElementById("other").value = "";

      } else if (choice > 0){
          document.getElementById(optionSelection[0]).setAttribute("class", "option");
          optionSelection = [];
          this.className += " active";
          optionSelection.push(event.target.id);
          document.getElementById("other").removeAttribute("disabled");
        

    } else {

    } 
    });
  }