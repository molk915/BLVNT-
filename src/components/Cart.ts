import { cartService } from "../services/cart";

export class CartComponent {
  private cartSidebar: HTMLElement | null = null;
  private cartOverlay: HTMLElement | null = null;
  private cartCountElement: HTMLElement | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    // Subskrybuj zmiany w koszyku
    this.unsubscribe = cartService.subscribe(() => {
      this.updateDisplay();
    });

    // Znajdź elementy DOM po załadowaniu strony
    setTimeout(() => {
      this.cartSidebar = document.querySelector(".cart-sidebar");
      this.cartOverlay = document.querySelector(".cart-overlay");
      this.cartCountElement = document.querySelector(".cart-count");

      this.setupEventListeners();
      this.updateDisplay();
    }, 100);
  }

  private setupEventListeners(): void {
    const cartIcon = document.querySelector(".cart-icon");
    const closeCartBtn = document.querySelector(".close-cart");

    cartIcon?.addEventListener("click", () => this.openCart());
    closeCartBtn?.addEventListener("click", () => this.closeCart());
    this.cartOverlay?.addEventListener("click", () => this.closeCart());
  }

  private updateDisplay(): void {
    this.updateCartCount();
    this.updateCartItems();
    this.updateCartTotal();
  }

  private updateCartCount(): void {
    const count = cartService.getItemCount();
    if (this.cartCountElement) {
      this.cartCountElement.textContent = count.toString();
      this.cartCountElement.style.display = count > 0 ? "flex" : "none";
    }
  }

  private updateCartItems(): void {
    const cartItemsContainer = document.querySelector(".cart-items");
    if (!cartItemsContainer) return;

    const items = cartService.getItems();

    if (items.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-cart"></i>
          <p>Twój koszyk jest pusty</p>
          <button class="continue-shopping" onclick="window.cartComponent.closeCart(); document.querySelector('#products').scrollIntoView({behavior: 'smooth'})">
            Kontynuuj zakupy
          </button>
        </div>
      `;
      return;
    }

    cartItemsContainer.innerHTML = items
      .map(
        (item) => `
      <div class="cart-item">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}" />
        </div>
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-category">${item.category}</div>
          <div class="cart-item-price">${item.price.toFixed(2)} zł</div>
          <div class="quantity-controls">
            <button class="quantity-btn" onclick="window.cartComponent.updateQuantity(${
              item.id
            }, ${item.quantity - 1})">
              <i class="fas fa-minus"></i>
            </button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-btn" onclick="window.cartComponent.updateQuantity(${
              item.id
            }, ${item.quantity + 1})">
              <i class="fas fa-plus"></i>
            </button>
            <button class="remove-item-btn" onclick="window.cartComponent.removeItem(${
              item.id
            })">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          <div class="item-total">${(item.price * item.quantity).toFixed(
            2
          )} zł</div>
        </div>
      </div>
    `
      )
      .join("");
  }

  private updateCartTotal(): void {
    const cartTotalElement = document.querySelector(
      ".cart-total .total-amount"
    );
    const checkoutBtn = document.querySelector(
      ".checkout-btn"
    ) as HTMLButtonElement;

    if (cartTotalElement) {
      cartTotalElement.textContent = `${cartService.getTotal().toFixed(2)} zł`;
    }

    if (checkoutBtn) {
      checkoutBtn.disabled = cartService.getItemCount() === 0;
    }
  }

  public openCart(): void {
    this.cartSidebar?.classList.add("show");
    this.cartOverlay?.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  public closeCart(): void {
    this.cartSidebar?.classList.remove("show");
    this.cartOverlay?.classList.remove("show");
    document.body.style.overflow = "";
  }

  public addItem(product: any): void {
    cartService.addItem(product);
    this.showAddToCartAnimation();
  }

  public removeItem(productId: number): void {
    cartService.removeItem(productId);
  }

  public updateQuantity(productId: number, quantity: number): void {
    cartService.updateQuantity(productId, quantity);
  }

  public checkout(): void {
    if (cartService.getItemCount() === 0) return;

    // Przekieruj do strony checkout
    window.location.hash = "#checkout";
    this.closeCart();
  }

  private showAddToCartAnimation(): void {
    const cartIcon = document.querySelector(".cart-icon");
    cartIcon?.classList.add("bounce");
    setTimeout(() => {
      cartIcon?.classList.remove("bounce");
    }, 600);
  }
  public destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  public renderModal(container: HTMLElement): void {
    const items = cartService.getItems();
    const total = cartService.getTotal();

    container.innerHTML = `
      <div class="cart-modal-header">
        <h2>Koszyk</h2>
      </div>
      <div class="cart-modal-body">
        ${
          items.length === 0
            ? `
          <div class="empty-cart">
            <p>Koszyk jest pusty</p>
            <button class="btn-secondary" onclick="document.getElementById('cartModal').style.display='none'">
              Kontynuuj zakupy
            </button>
          </div>
        `
            : `
          <div class="cart-items">
            ${items
              .map(
                (item) => `
              <div class="cart-modal-item">
                <div class="cart-item-image">
                  <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                  <h4>${item.name}</h4>
                  <p class="cart-item-price">${item.price.toFixed(2)} zł</p>
                  <div class="quantity-controls">                    <button class="quantity-btn" onclick="cartService.updateQuantity(${
                    item.id
                  }, ${item.quantity - 1}); app.updateCartModal()">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="cartService.updateQuantity(${
                      item.id
                    }, ${item.quantity + 1}); app.updateCartModal()">+</button>
                  </div>
                </div>
                <div class="cart-item-total">
                  <span>${(item.price * item.quantity).toFixed(
                    2
                  )} zł</span>                  <button class="remove-item" onclick="cartService.removeItem(${
                  item.id
                }); app.updateCartModal()">🗑️</button>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
          <div class="cart-modal-footer">
            <div class="cart-total">
              <strong>Suma: ${total.toFixed(2)} zł</strong>
            </div>
            <div class="cart-actions">
              <button class="btn-secondary" onclick="document.getElementById('cartModal').style.display='none'">
                Kontynuuj zakupy
              </button>
              <button class="btn-primary" onclick="app.goToCheckout()">
                Przejdź do kasy
              </button>
            </div>
          </div>
        `
        }
      </div>
    `;
  }
}
