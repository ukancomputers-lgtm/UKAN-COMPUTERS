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
  cart.push({ name, price });
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
    // Clean numeric calculation for price
    let numericPrice = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
    total += numericPrice;

    let row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.price}</td>
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