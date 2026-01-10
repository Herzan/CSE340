// client-side script for basic validation and AJAX submit
document.addEventListener('DOMContentLoaded', function(){
  const form = document.getElementById('orderForm');
  const ordersList = document.querySelector('.orders-list');

  form.addEventListener('submit', async function(e){
    // prevent default and do fetch
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const model = form.model.value;
    const quantity = form.quantity.value;

    const errors = [];
    if (name.length < 2) errors.push('Name must be at least 2 characters.');
    if (!/^\S+@\S+\.\S+$/.test(email)) errors.push('Please enter a valid email.');
    if (!model) errors.push('Please choose a model.');
    if (!quantity || Number(quantity) < 1) errors.push('Please choose a quantity.');

    // client-side error display
    const existingAlert = document.querySelector('.error-list');
    if (existingAlert) existingAlert.remove();

    if (errors.length) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-list';
      errorDiv.setAttribute('role','alert');
      errorDiv.innerHTML = `<p><strong>Fix these:</strong></p><ul>${errors.map(e=>`<li>${e}</li>`).join('')}</ul>`;
      form.parentElement.insertBefore(errorDiv, form);
      return;
    }

    // send JSON to server
    try {
      const resp = await fetch('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, model, quantity })
      });

      if (!resp.ok) {
        const body = await resp.json().catch(()=>({ errors: ['Unknown server error'] }));
        const serverErrors = body.errors || ['Server validation error'];
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-list';
        errorDiv.innerHTML = `<p><strong>Server says:</strong></p><ul>${serverErrors.map(e=>`<li>${e}</li>`).join('')}</ul>`;
        form.parentElement.insertBefore(errorDiv, form);
        return;
      }

      const data = await resp.json();
      // update orders list visually (prepend)
      const ul = ordersList.querySelector('ul') || (() => {
        const u = document.createElement('ul');
        ordersList.appendChild(u);
        return u;
      })();

      const li = document.createElement('li');
      li.innerHTML = `<strong>${escapeHtml(data.order.name)}</strong> requested <em>${escapeHtml(data.order.quantity.toString())} × ${escapeHtml(data.order.model)}</em>`;
      ul.insertBefore(li, ul.firstChild);

      // reset form
      form.reset();
      form.quantity.value = 1;

    } catch (err) {
      console.error(err);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-list';
      errorDiv.innerHTML = `<p><strong>Network error</strong></p><p>Could not submit request.</p>`;
      form.parentElement.insertBefore(errorDiv, form);
    }
  });

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }
});
