// Get the container element
const btnContainer = document.getElementById("container");

// Get all buttons with class="btn" inside the container
const btns = document.getElementsByClassName("btn");

const buttons = document.getElementsByTagName("button");

// Bet multiplier based on selection category
const betMult = ["nonViolent",
                "property",
                "lessViolent",
                "commonViolent",
                "rareViolent"
                ];

const multVal = [0.2,
                0.5,
                0.75,
                0.95,
                2
                ];

document.getElementById("betInput").addEventListener("input", calcPayout);

const allCrimeOpt = ["Shooting/Shots Fired",
                    "Assault with a Deadly Weapon",
                    "Aggravated Assault",
                    "Robbery",
                    "Vehicle Hit & Run",
                    "Aggravated Sexual Assault",
                    "Homicide",
                    "Kidnapping/Abduction",
                    "Domestic Dispute/Situation",
                    "Evading Police",
                    "Person with a Gun",
                    "Suicide/Attempted Suicide",
                    "Burglary",
                    "Grand Larceny-theft",
                    "Motor Vehicle Theft",
                    "Destruction/Damage/Vandalism of Property",
                    "Arson",
                    "Felony Drug Possession",
                    "Prostitution"
                  ]

const wheelImg = ["img/1x.gif",
                  "img/2x.gif",
                  "img/3x.gif",
                  "img/4x.gif",
                  "img/5x.gif"
                ]

// Add the active class to the clicked button
// Keeps track of totalMult and when over a threshold proceeds bet to next section
// On threshold hit, change button type to disabled
// On threshold hit, require user click reset button to change bet
let selectedOptions = [];
let totalMult = 0;
let currentPay = 0;

// listens for click, then highlights button, adds the selection ID to an array,
// Array is used to change all selected options back to non-active (highlighted) on reset button click
// On button click adds that option to a list underneath, (multipliers and categories will be shared there)
  // Clicking the reset button also resets that created list
// Counts total selections which max out at 5, then disables all buttons for max bet.
// User needs to click reset button (input) to re-enable buttons, and refresh selection

for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function() {
    if (this.className != "btn active" && totalMult < 5) {
        selectedOptions.push(event.target.id);
        let betPick = event.target.value;
        let betId = event.target.id;
        this.className += " active";
        let currentCat = document.getElementById(betId).parentNode.id;
        let currentMult = betMult.indexOf(currentCat);
        let mult = multVal[currentMult];
        let node = document.createElement("li");
        const textNode = document.createTextNode(betPick + " | x" + mult + " multiplier");
        node.appendChild(textNode);
        document.getElementById("betsChosen").appendChild(node);
        totalMult = Math.ceil((totalMult + mult) * 100) / 100;
        document.getElementById("betMultiplier").innerHTML = "x" + totalMult + "(total bet multiplier)";

        if (totalMult >= 5) {
        document.getElementById("betInput").removeAttribute("disabled");
        for (const button of buttons) {
        button.disabled = true;
        };

        const buttonsToEnable = document.querySelectorAll('.no-disable');
        for (const button of buttonsToEnable) {
            button.disabled = false;
        }
      } else {

      }

    } else if (this.className === "btn active"){

    } else {

    } 
    });
  }

function calcPayout() {
  let currentPay = Math.ceil((document.getElementById("betInput").value * totalMult) * 100) / 100;
  document.getElementById("potentialWin").innerHTML = currentPay + " DOSCoin";
}

function resetBet() {
  for (const button of buttons) {
      setTimeout(function(){
        button.disabled = false;
        for (var i = 0; i < selectedOptions.length; i++) {
          document.getElementById(selectedOptions[i]).setAttribute("class", "btn");
        };
        document.getElementById("betsChosen").innerHTML = "";
        selectedOptions = [];
        totalMult = 0;
        document.getElementById("betMultiplier").innerHTML = "";
        document.getElementById("betInput").setAttribute("disabled","");
        document.getElementById("betInput").value = "";
        document.getElementById("potentialWin").innerHTML = "";
        document.getElementById("verifyStatus").innerHTML = "";
        document.getElementById("wheelResult").innerHTML = "";
        document.getElementById("bonusPotential").innerHTML = "";
        document.getElementById("wheelPotential").innerHTML = "";
      }, 50);
    };
}

function verifyWager() {
  let betInput = document.getElementById("betInput");
  let betValue = betInput.value;
  let betToInt = Math.floor(betValue);
  if (betToInt === parseInt(betValue, 10) && betToInt >= 25) {
    console.log("data is an integer");
    document.getElementById("verifyStatus").innerHTML = "Betting window currently closed. Check back when feed is live.";
    console.log(document.getElementById("potentialWin").innerHTML);
  
  } else if(betToInt === parseInt(betValue, 10) && betToInt < 25) {
      console.log("input is less than 25");
      document.getElementById("verifyStatus").innerHTML = "Wager amount below minimum.";
  } else {
    console.log("NON INTEGER");
    document.getElementById("verifyStatus").innerHTML = "Input is blank/contains invalid characters, try again.";
    document.getElementById("betInput").value = "";
  }
}

//Disables input field, clears previous wheel result if any, removes onclick on preview spin "button"
//On final spin tick noise, result is added to page
function spinPreview() {
    sendEventToUnreal("PlaySpinWheel", {});

  let wheelCrime = Math.floor(Math.random() * 19);
  let wheelMult = Math.floor(Math.random() * 5) + 1;
  document.getElementById("betInput").setAttribute("disabled","");
  document.getElementById("wheelResult").innerHTML = "";
  document.getElementById("wheelPotential").innerHTML = "";
  document.getElementById("bonusPotential").innerHTML = "";
  document.getElementById("wheelButtonPreview").removeAttribute("onclick");

  let betInput = document.getElementById("betInput");
  let betValue = betInput.value;
  let betToInt = Math.ceil(betValue * 100) / 100;
  let intWin = Math.ceil((betValue * totalMult) * 100) / 100;

//Switch static wheel image to gif
  setTimeout(function(){
      document.getElementById("wheel-image").setAttribute("src", "img/spinThatWheel.gif");
    }, 2400)

    setTimeout(function(){
      document.getElementById("wheel-image").setAttribute("src", wheelImg[wheelMult-1]);
    }, 4600)

// Takes the current winnings and adds the wheel multiplier to the total mult and displays that result
  setTimeout(function(){
  let newPotential = Math.ceil((betToInt * (totalMult + wheelMult)) * 100) / 100;

  document.getElementById("wheelResult").innerHTML = allCrimeOpt[wheelCrime] + " | + x" + wheelMult + " BONUS MULTIPLIER";
  document.getElementById("wheelPotential").innerHTML = "New Total Potential Win: " + newPotential + " DOSCoin"
  document.getElementById("bonusPotential").innerHTML = " (included " + Math.round((newPotential * 100) - (intWin * 100)) / 100 + " DOSCoin Wheel Bonus)";
}, 6500);

//Re-enables preview spin button after audio has finished playing to avoid a spin with no audio
  setTimeout(function(){
  document.getElementById("wheelButtonPreview").setAttribute("onclick","spinPreview()");
  let newPotential = 0;
  }, 8200);
}
