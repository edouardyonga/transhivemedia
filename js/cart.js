(function() {
    const CART_KEY = "cartItems";

    // Retrieve cart data from localStorage, or return an empty array if none exists.
    function getCart() {
        let cart = localStorage.getItem(CART_KEY);
        return cart ? JSON.parse(cart) : [];
    }

    // Save the cart array to localStorage.
    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    // Generate a unique product ID based on the product title and price.
    function generateProductId(title, price) {
        return title.trim().toLowerCase().replace(/\s+/g, '_') + '_' + price;
    }

    // Add a product to the cart; if it exists, increase its quantity.
    function addToCart(product) {
        let cart = getCart();
        let index = cart.findIndex(item => item.id === product.id);
        if (index !== -1) {
            cart[index].quantity += product.quantity;
        } else {
            cart.push(product);
        }
        saveCart(cart);
        updateCartCount();
    }

    // Update the header cart count (assumes an element with class "cart-count" exists).
    function updateCartCount() {
        let cart = getCart();
        let count = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = count;
        }
    }

    // Render the cart items on the cart.html page.
    function renderCart() {
        let cart = getCart();
        const tbody = document.querySelector('.cart_inner table tbody');
        if (!tbody) return;
        tbody.innerHTML = ''; // Clear previous rows
        let subtotal = 0;
        cart.forEach(item => {
            let total = item.price * item.quantity;
            subtotal += total;
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>
          <div class="media">
            <div class="d-flex">
              <img src="${item.image}" alt="">
            </div>
            <div class="media-body">
              <p>${item.title}</p>
            </div>
          </div>
        </td>
        <td>
          <h5>$${item.price.toFixed(2)}</h5>
        </td>
        <td>
          <div class="product_count">
            <button class="reduced items-count" data-id="${item.id}">-</button>
            <input type="text" name="qty" value="${item.quantity}" class="input-text qty" data-id="${item.id}">
            <button class="increase items-count" data-id="${item.id}">+</button>
          </div>
        </td>
        <td>
          <h5>$${total.toFixed(2)}</h5>
        </td>
        <td>
          <button class="remove-item" data-id="${item.id}" style="
    cursor: pointer;
">Remove</button>
        </td>
      `;
            tbody.appendChild(tr);
        });
        // Update the subtotal display if an element with class "subtotal" exists.
        const subtotalElement = document.querySelector('.cart_inner .subtotal');
        if (subtotalElement) {
            subtotalElement.innerHTML = `<strong style="font-size:1.2em; color:#d9534f;">$${subtotal.toFixed(2)}</strong>`;
        }
    }

    // Update an item's quantity and re-render the cart.
    function updateItemQuantity(id, newQuantity) {
        let cart = getCart();
        let index = cart.findIndex(item => item.id === id);
        if (index !== -1) {
            cart[index].quantity = newQuantity;
            if (newQuantity <= 0) {
                // Remove the item if quantity drops to zero.
                cart.splice(index, 1);
            }
            saveCart(cart);
            renderCart();
            updateCartCount();
        }
    }

    // Remove an item from the cart.
    function removeItem(id) {
        let cart = getCart();
        cart = cart.filter(item => item.id !== id);
        saveCart(cart);
        renderCart();
        updateCartCount();
    }

    // Set up event listeners on "Add to Bag" buttons across product pages.
    function setupAddToCartButtons() {
        const buttons = document.querySelectorAll('.add-to-cart');
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const title = button.getAttribute('data-title');
                const price = parseFloat(button.getAttribute('data-price'));
                const image = button.getAttribute('data-image');
                const id = generateProductId(title, price);
                const product = {
                    id,
                    title,
                    price,
                    image,
                    quantity: 1
                };
                addToCart(product);
                // Provide user feedback.
                alert('Product added to cart!');
            });
        });
    }

    // Set up event listeners for quantity changes and removal on the cart page.
    function setupCartPageListeners() {
        const tbody = document.querySelector('.cart_inner table tbody');
        if (tbody) {
            tbody.addEventListener('click', function(e) {
                const target = e.target;
                if (target.classList.contains('increase')) {
                    const id = target.getAttribute('data-id');
                    const input = document.querySelector(`input.qty[data-id="${id}"]`);
                    const quantity = parseInt(input.value);
                    updateItemQuantity(id, quantity + 1);
                }
                if (target.classList.contains('reduced')) {
                    const id = target.getAttribute('data-id');
                    const input = document.querySelector(`input.qty[data-id="${id}"]`);
                    const quantity = parseInt(input.value);
                    updateItemQuantity(id, quantity - 1);
                }
                if (target.classList.contains('remove-item')) {
                    const id = target.getAttribute('data-id');
                    removeItem(id);
                }
            });
            // Update quantity when the user manually changes the input.
            tbody.addEventListener('change', function(e) {
                const target = e.target;
                if (target.classList.contains('qty')) {
                    const id = target.getAttribute('data-id');
                    let quantity = parseInt(target.value);
                    if (isNaN(quantity) || quantity < 0) quantity = 1;
                    updateItemQuantity(id, quantity);
                }
            });
        }
    }

    // Render the order summary on the checkout page.
    function renderCheckoutSummary() {
        const cart = getCart();
        const orderBox = document.querySelector('.order_box');
        if (orderBox) {
            let orderHTML = '<h2>Your Order</h2>';
            orderHTML += '<ul class="list">';
            orderHTML += '<li><a href="#">Product <span>Total</span></a></li>';
            let subtotal = 0;
            cart.forEach(item => {
                let total = item.price * item.quantity;
                subtotal += total;
                orderHTML += `<li><a href="#">${item.title} <span class="middle">x ${item.quantity}</span> <span class="last">$${total.toFixed(2)}</span></a></li>`;
            });
            orderHTML += '</ul>';
            orderHTML += '<ul class="list list_2">';
            orderHTML += `<li><a href="#">Subtotal <span>$${subtotal.toFixed(2)}</span></a></li>`;
            // Shipping fee is hardcoded here; adjust as needed.
            orderHTML += `<li><a href="#">Shipping <span>Flat rate: $15.00</span></a></li>`;
            orderHTML += `<li><a href="#">Total <span>$${(subtotal + 15).toFixed(2)}</span></a></li>`;
            orderHTML += '</ul>';
            orderBox.innerHTML = orderHTML;
        }
    }

    // Initialize functions based on the current page.
    document.addEventListener('DOMContentLoaded', function() {
        updateCartCount();
        setupAddToCartButtons();
        if (document.querySelector('.cart_inner')) {
            renderCart();
            setupCartPageListeners();
        }
        if (document.querySelector('.order_box')) {
            renderCheckoutSummary();
        }
    });
})();