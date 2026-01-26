const form = document.querySelector('#updateRegistrationForm')
form.addEventListener('change', function () {
    const updateBtn = document.querySelector('button')
    updateBtn.removeAttribute('disabled')
})