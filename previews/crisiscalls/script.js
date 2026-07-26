document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("login-button");
    const errorBar = document.querySelector(".error-bar");

    let loadingInterval;

    button.addEventListener("click", () => {
        let dots = "";
        let baseText = "Giriş yapılıyor";
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
            button.textContent = "Giriş Yap";
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
        let baseText = "Bağlantı gönderiliyor";
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
            button.textContent = "Şifre Sıfırlama Bağlantısı Gönder";
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
            toggleBtn.textContent = '+ Altyazılar';
        } else {
            captionsContent.style.display = 'block';
            toggleBtn.textContent = '- Altyazılar';
        }
    });
});
