document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("login-button");
    const errorBar = document.querySelector(".error-bar");

    let loadingInterval;

    button.addEventListener("click", () => {
        let dots = "";
        let baseText = "Logging in";
        let dotCount = 0;

        button.disabled = true;

        if (errorBar) {
            errorBar.style.opacity = "0";
            errorBar.style.visibility = "hidden";
        }

        loadingInterval = setInterval(() => {
            dotCount = (dotCount + 1) % 4;
            dots = ".".repeat(dotCount);
            button.textContent = baseText + dots;
        }, 200);

        setTimeout(() => {
            clearInterval(loadingInterval);
            button.textContent = "Log In";
            button.disabled = false;

            if (errorBar) {
                errorBar.style.visibility = "visible";
                errorBar.style.opacity = "1";
            }
        }, 2500);
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("reset-password-button");
    const errorBar = document.querySelector(".error-bar");

    let loadingInterval;

    button.addEventListener("click", () => {
        let dots = "";
        let baseText = "Sending link";
        let dotCount = 0;

        button.disabled = true;

        if (errorBar) {
            errorBar.style.opacity = "0";
            errorBar.style.visibility = "hidden";
        }

        loadingInterval = setInterval(() => {
            dotCount = (dotCount + 1) % 4;
            dots = ".".repeat(dotCount);
            button.textContent = baseText + dots;
        }, 200);

        setTimeout(() => {
            clearInterval(loadingInterval);
            button.textContent = "Send Reset Password Link";
            button.disabled = false;

            if (errorBar) {
                errorBar.style.visibility = "visible";
                errorBar.style.opacity = "1";
            }
        }, 2500);
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggle-captions');
    const captionsContent = document.getElementById('captions-content');

    toggleBtn.addEventListener('click', () => {
        if (captionsContent.style.display === 'block') {
            captionsContent.style.display = 'none';
            toggleBtn.textContent = '+ Closed Captions';
        } else {
            captionsContent.style.display = 'block';
            toggleBtn.textContent = '- Closed Captions';
        }
    });
});
