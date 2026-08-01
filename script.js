// Filter logic for Gallery
function filterSelection(category, event) {
  const cards = document.querySelectorAll('.product-card');
  const buttons = document.querySelectorAll('.filter-btn');
  const counterElement = document.getElementById('item-count');

  if (buttons.length > 0 && event) {
    buttons.forEach(btn => btn.classList.remove('active'));
    if (event.currentTarget) {
      event.currentTarget.classList.add('active');
    }
  }

  let visibleCount = 0;

  cards.forEach(card => {
    if (category === 'all' || card.getAttribute('data-category') === category) {
      card.classList.add('show');
      visibleCount++;
    } else {
      card.classList.remove('show');
    }
  });

  if (counterElement) {
    counterElement.textContent = `Showing ${visibleCount} items`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('laptop-grid')) {
    filterSelection('all');
  }
  loadCartItems();
});

// Cart Management Functionality
function addToCart(name, price) {
  let cart = JSON.parse(localStorage.getItem('ukan_cart')) || [];
  cart.push({ name, price: String(price) });
  localStorage.setItem('ukan_cart', JSON.stringify(cart));
  alert(name + ' has been added to your profile cart!');
}

function loadCartItems() {
  const cartTableBody = document.getElementById('cart-items-body');
  const cartTotalElement = document.getElementById('cart-total');
  if (!cartTableBody) return;

  let cart = JSON.parse(localStorage.getItem('ukan_cart')) || [];
  cartTableBody.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    cartTableBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Your cart is currently empty. Browse the gallery to add items!</td></tr>';
    if (cartTotalElement) cartTotalElement.textContent = 'KSh 0';
    return;
  }

  cart.forEach((item, index) => {
    let numericPrice = parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;
    total += numericPrice;

    let row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.price.includes('KSh') ? item.price : 'KSh ' + numericPrice.toLocaleString()}</td>
      <td><button class="remove-btn" onclick="removeFromCart(${index})">Remove</button></td>
    `;
    cartTableBody.appendChild(row);
  });

  if (cartTotalElement) {
    cartTotalElement.textContent = 'KSh ' + total.toLocaleString();
  }
}

function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem('ukan_cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('ukan_cart', JSON.stringify(cart));
  loadCartItems(); 
}

function clearCart() {
  localStorage.removeItem('ukan_cart');
  loadCartItems();
}

// --- Dynamic Payment Modal Engine ---
function openPaymentModal() {
  let totalText = document.getElementById('cart-total').innerText;
  let totalAmount = parseInt(totalText.replace(/[^0-9]/g, ''), 10);

  if (!totalAmount || totalAmount <= 0) {
    alert("Your cart is empty! Please add a laptop to your cart first.");
    return;
  }
  document.getElementById('payment-modal').style.display = 'flex';
}

function closePaymentModal() {
  document.getElementById('payment-modal').style.display = 'none';
}

function switchPaymentTab(element, panelId) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
  element.classList.add('active');
  document.getElementById(panelId).classList.add('active');
}

// --- Instant M-Pesa STK Push Gateway Handler ---
function payWithPaystack() {
  let totalText = document.getElementById('cart-total').innerText;
  let totalAmount = parseInt(totalText.replace(/[^0-9]/g, ''), 10);

  // 1. Instantly ask for Safaricom line details to avoid iframe entry manual errors
  let customerPhone = prompt("Enter your Safaricom M-Pesa Phone Number (e.g., 0712345678):");
  if (!customerPhone) return;

  // Clean formatting white space and prefix standard 254 Kenya routing code
  let cleanPhone = customerPhone.replace(/\s+/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '254' + cleanPhone.substring(1);
  }

  // 2. Request standard transactional billing log fallback email address
  let customerEmail = prompt("Please enter your email address to receive your order receipt:", "customer@gmail.com");
  if (!customerEmail) return;

  closePaymentModal(); 

  let handler = PaystackPop.setup({
    key: 'pk_live_YOUR_PUBLIC_KEY_HERE', // <-- Put your Live Public Key from Paystack Dashboard here
    email: customerEmail,
    amount: totalAmount * 100, 
    currency: 'KES', 
    ref: 'UKAN-' + Math.floor((Math.random() * 1000000000) + 1),
    
    // Explicit phone loading configuration bypasses credit card interfaces
    phone: cleanPhone,
    channels: ['mobile_money'], 
    
    metadata: {
      custom_fields: [
        {
          display_name: "Payment Type",
          variable_name: "payment_type",
          value: "Lipa Na M-Pesa STK Push"
        },
        {
          display_name: "Customer M-Pesa Number",
          variable_name: "customer_mpesa_number",
          value: cleanPhone
        },
        {
          display_name: "Merchant Till Number",
          variable_name: "merchant_till_number",
          value: "946097" 
        }
      ]
    },
    
    callback: function(response) {
      alert('M-Pesa Payment Successful! Reference ID: ' + response.reference);
      clearCart();
      window.location.href = "index.html";
    },
    onClose: function() {
      alert('Transaction closed. Items are safely saved in your cart.');
      openPaymentModal(); 
    }
  });

  handler.openIframe();
}
