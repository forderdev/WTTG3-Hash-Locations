// for each input add an event listener
document.querySelectorAll('.qty-input').forEach(input => {
    // block negative values
    input.addEventListener('input', () => {
        // remove all zeros from the beginning
        input.value = input.value.replace(/^0+(?=\d)/, '');

        if (input.value < 0) {
            input.value = 0;
        }
        checkQtySum();
    });

    // blacklist keys
    input.addEventListener('keydown', (event) => {
        const allowedKeys = [
            "Backspace", "ArrowLeft", "ArrowRight",
            "ArrowUp", "ArrowDown", "Tab", "Delete"
        ];

        if (allowedKeys.includes(event.key) || (event.key >= '0' && event.key <= '9')) {
            return; // allowed - do nothing
        }

        // block all other keys
        event.preventDefault();
    })
});

const qtyMetText = document.getElementById("qty-met");
const qtyNotMetText = document.getElementById("qty-not-met");

const contactInfoInput = document.getElementById("contact-input")
const errorMsgText = document.getElementById("error-msg");


let qtySum = 0;
function checkQtySum() {
    qtySum = 0;
    document.querySelectorAll('.qty-input').forEach(input => {
        qtySum += input.value == '' ? 0 : parseInt(input.value);
    })

    if (qtySum > 5) {
        qtyMetText.style.display = "block";
        qtyNotMetText.style.display = "none";
    } else {
        qtyMetText.style.display = "none";
        qtyNotMetText.style.display = "block";
    }
}

function submitOrder() {
    errorMsgText.innerHTML = "";

    let errorMsg = "";

    if (qtySum == 0) {
        errorMsg += "Your order is empty, please provide the quantity of items you request.<br>"
    }

    if (!isContactInfoValid(contactInfoInput.value)) {
        errorMsg += "Please provide your contact information.";
    }

    if (errorMsg.length > 0) {
        errorMsgText.innerHTML = errorMsg;
        errorMsgText.style.display = "block";
        return;
    }
    errorMsgText.style.display = "none";

    LinkClick('ordersent.html');

}

function isContactInfoValid(value) {
    return /.*\S.*/.test(value);
}