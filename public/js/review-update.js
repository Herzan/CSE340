const form = document.querySelector('#updateReviewForm')
form.addEventListener('change', function () {
    const updateBtn = document.querySelector('button')
    updateBtn.removeAttribute('disabled')
})
