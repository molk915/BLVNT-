import { cartService } from "../services/cart";
import { orderService } from "../services/orders";
import type { CustomerInfo } from "../types";

export class CheckoutPage {
  render(): string {
    const items = cartService.getItems();
    const total = cartService.getTotal();

    if (items.length === 0) {
      return `
        <div class="checkout-page">
          <div class="container">
            <div class="empty-checkout">
              <h2>Koszyk jest pusty</h2>
              <p>Dodaj produkty do koszyka, aby móc złożyć zamówienie.</p>
              <a href="#products" class="cta-button">Zobacz produkty</a>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="checkout-page">
        <div class="container">
          <h1 class="page-title">Finalizacja zamówienia</h1>
          
          <div class="checkout-content">
            <div class="checkout-form">
              <h2>Dane do wysyłki</h2>
              <form id="checkout-form">
                <div class="form-row">
                  <div class="form-group">
                    <label for="firstName">Imię *</label>
                    <input type="text" id="firstName" name="firstName" required>
                  </div>
                  <div class="form-group">
                    <label for="lastName">Nazwisko *</label>
                    <input type="text" id="lastName" name="lastName" required>
                  </div>
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label for="email">Email *</label>
                    <input type="email" id="email" name="email" required>
                  </div>
                  <div class="form-group">
                    <label for="phone">Telefon *</label>
                    <input type="tel" id="phone" name="phone" required>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="address">Adres *</label>
                  <input type="text" id="address" name="address" placeholder="ul. Nazwa 123" required>
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label for="city">Miasto *</label>
                    <input type="text" id="city" name="city" required>
                  </div>
                  <div class="form-group">
                    <label for="postalCode">Kod pocztowy *</label>
                    <input type="text" id="postalCode" name="postalCode" placeholder="00-000" required>
                  </div>
                </div>
                
                <h3>Sposób płatności</h3>
                <div class="payment-methods">
                  <label class="payment-option">
                    <input type="radio" name="paymentMethod" value="card" checked>
                    <span class="payment-label">
                      <i class="fas fa-credit-card"></i>
                      Karta płatnicza
                    </span>
                  </label>
                  
                  <label class="payment-option">
                    <input type="radio" name="paymentMethod" value="transfer">
                    <span class="payment-label">
                      <i class="fas fa-university"></i>
                      Przelew bankowy
                    </span>
                  </label>
                  
                  <label class="payment-option">
                    <input type="radio" name="paymentMethod" value="cash">
                    <span class="payment-label">
                      <i class="fas fa-money-bill"></i>
                      Płatność przy odbiorze
                    </span>
                  </label>
                </div>
                
                <div class="form-actions">
                  <button type="button" class="btn-secondary" onclick="window.location.hash = '#products'">
                    Wróć do sklepu
                  </button>
                  <button type="submit" class="btn-primary">
                    <i class="fas fa-lock"></i>
                    Złóż zamówienie
                  </button>
                </div>
              </form>
            </div>
            
            <div class="order-summary">
              <h2>Podsumowanie zamówienia</h2>
              
              <div class="order-items">
                ${items
                  .map(
                    (item) => `
                  <div class="order-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                      <h4>${item.name}</h4>
                      <p>Ilość: ${item.quantity}</p>
                      <p class="item-price">${(
                        item.price * item.quantity
                      ).toFixed(2)} zł</p>
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>
              
              <div class="order-totals">
                <div class="total-row">
                  <span>Wartość produktów:</span>
                  <span>${total.toFixed(2)} zł</span>
                </div>
                <div class="total-row">
                  <span>Dostawa:</span>
                  <span>${total > 200 ? "Gratis" : "15.00 zł"}</span>
                </div>
                <div class="total-row total-final">
                  <span>Do zapłaty:</span>
                  <span>${(total > 200 ? total : total + 15).toFixed(
                    2
                  )} zł</span>
                </div>
              </div>
              
              <div class="shipping-info">
                <h3><i class="fas fa-truck"></i> Informacje o dostawie</h3>
                <ul>
                  <li>Czas dostawy: 1-3 dni robocze</li>
                  <li>Darmowa dostawa od 200 zł</li>
                  <li>Możliwość zwrotu do 30 dni</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners(): void {
    const form = document.getElementById("checkout-form") as HTMLFormElement;
    if (form) {
      form.addEventListener("submit", this.handleSubmit.bind(this));
    }
  }

  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const customerInfo: CustomerInfo = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      postalCode: formData.get("postalCode") as string,
      paymentMethod: formData.get("paymentMethod") as
        | "card"
        | "transfer"
        | "cash",
    };

    // Walidacja
    if (!this.validateForm(customerInfo)) {
      return;
    }

    // Zablokuj przycisk podczas przetwarzania
    const submitBtn = form.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Przetwarzanie...';

    try {
      // Symulacja opóźnienia API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Utwórz zamówienie
      const items = cartService.getItems();
      const order = orderService.createOrder(items, customerInfo);

      // Wyczyść koszyk
      cartService.clearCart();

      // Przekieruj do strony potwierdzenia
      window.location.hash = `#order-confirmation/${order.id}`;
    } catch (error) {
      console.error("Błąd podczas składania zamówienia:", error);
      alert("Wystąpił błąd podczas składania zamówienia. Spróbuj ponownie.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }

  private validateForm(customerInfo: CustomerInfo): boolean {
    // Walidacja kodu pocztowego
    const postalCodeRegex = /^\d{2}-\d{3}$/;
    if (!postalCodeRegex.test(customerInfo.postalCode)) {
      alert("Nieprawidłowy format kodu pocztowego. Użyj formatu XX-XXX");
      return false;
    }

    // Walidacja emaila
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      alert("Nieprawidłowy format adresu email");
      return false;
    }

    // Walidacja telefonu
    const phoneRegex = /^(\+48\s?)?[\d\s\-\(\)]{9,}$/;
    if (!phoneRegex.test(customerInfo.phone)) {
      alert("Nieprawidłowy format numeru telefonu");
      return false;
    }

    return true;
  }
}
