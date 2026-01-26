// Initiate the password visibility toggle button
const passWordBtn = document.querySelector('#passWordBtn')
if (passWordBtn) {
    passWordBtn.addEventListener('click', function () {
        const passWordInput = document.getElementById('account_password')
        const type = passWordInput.getAttribute('type')
        if (type === 'password') {
            passWordInput.setAttribute('type', 'text')
            passWordBtn.innerHTML = 'Hide Password'
        } else {
            passWordInput.setAttribute('type', 'password')
            passWordBtn.innerHTML = 'Show Password'
        }
    })
}
