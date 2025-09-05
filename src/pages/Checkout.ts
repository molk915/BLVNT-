import { cartService } from "../services/cart";
import { orderService } from "../services/orders";
import type { CustomerInfo } from "../types";

interface CheckoutData extends Partial<CustomerInfo> {
  shippingMethod?: "standard" | "express" | "pickup";
  shippingCost?: number;
}

export class CheckoutPage {
  private currentStep: number = 1;
  private checkoutData: CheckoutData = {};

  public render(): void {
    const mainContent = document.getElementById("mainContent")!;
    const items = cartService.getItems();

    if (items.length === 0) {
      mainContent.innerHTML = `
        <div class="checkout-container">
          <div class="container">
            <div class="empty-checkout">
              <div class="empty-icon">
                <i class="fas fa-shopping-cart"></i>
              </div>
              <h1 class="empty-title">Twój koszyk jest pusty</h1>
              <p class="empty-subtitle">Dodaj produkty do koszyka, aby móc złożyć zamówienie</p>
              <button class="btn-primary" onclick="app.navigateToPage('products')">
                <i class="fas fa-arrow-left"></i>
                Kontynuuj zakupy
              </button>
            </div>
          </div>
        </div>
      `;
      return;
    }

    mainContent.innerHTML = `
      <div class="checkout-container">
        <div class="container">
          <div class="checkout-header">
            <h1 class="checkout-title">Finalizacja zamówienia</h1>
            <p class="checkout-subtitle">Bezpieczna płatność • SSL szyfrowanie • Szybka dostawa</p>
          </div>

          ${this.renderProgressSteps()}

          <div class="checkout-content">
            <div class="checkout-main">
              ${this.renderCurrentStep()}
            </div>
            
            <div class="checkout-sidebar">
              ${this.renderOrderSummary()}
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  private renderProgressSteps(): string {
    const steps = [
      { number: 1, label: "Dane", icon: "fas fa-user" },
      { number: 2, label: "Dostawa", icon: "fas fa-truck" },
      { number: 3, label: "Płatność", icon: "fas fa-credit-card" },
      { number: 4, label: "Potwierdzenie", icon: "fas fa-check" },
    ];

    return `
      <div class="checkout-progress">
        <div class="progress-steps">
          ${steps
            .map(
              (step) => `
            <div class="progress-step ${
              this.currentStep >= step.number ? "active" : ""
            } ${
                this.currentStep === step.number ? "current" : ""
              }" data-step="${step.number}">
              <div class="step-icon">
                <i class="${step.icon}"></i>
              </div>
              <div class="step-info">
                <div class="step-number">${step.number}</div>
                <div class="step-label">${step.label}</div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  private renderCurrentStep(): string {
    switch (this.currentStep) {
      case 1:
        return this.renderCustomerInfoStep();
      case 2:
        return this.renderShippingStep();
      case 3:
        return this.renderPaymentStep();
      case 4:
        return this.renderConfirmationStep();
      default:
        return this.renderCustomerInfoStep();
    }
  }

  private renderCustomerInfoStep(): string {
    return `
      <div class="checkout-step" data-step="1">
        <div class="step-header">
          <h2 class="step-title">
            <i class="fas fa-user"></i>
            Dane kontaktowe i adres dostawy
          </h2>
          <p class="step-subtitle">Podaj swoje dane aby móc zrealizować zamówienie</p>
        </div>

        <form class="checkout-form" id="customer-info-form">
          <div class="form-section">
            <h3>Dane osobowe</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">Imię *</label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName" 
                  value="${this.checkoutData.firstName || ""}"
                  required
                >
              </div>
              <div class="form-group">
                <label for="lastName">Nazwisko *</label>
                <input 
                  type="text" 
                  id="lastName" 
                  name="lastName" 
                  value="${this.checkoutData.lastName || ""}"
                  required
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="email">Adres email *</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value="${this.checkoutData.email || ""}"
                  required
                >
              </div>
              <div class="form-group">
                <label for="phone">Numer telefonu *</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  placeholder="+48 123 456 789"
                  value="${this.checkoutData.phone || ""}"
                  required
                >
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Adres dostawy</h3>
            <div class="form-group">
              <label for="address">Ulica i numer domu/mieszkania *</label>
              <input 
                type="text" 
                id="address" 
                name="address" 
                placeholder="ul. Przykładowa 123/45"
                value="${this.checkoutData.address || ""}"
                required
              >
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="postalCode">Kod pocztowy *</label>
                <input 
                  type="text" 
                  id="postalCode" 
                  name="postalCode" 
                  placeholder="00-000"
                  pattern="[0-9]{2}-[0-9]{3}"
                  value="${this.checkoutData.postalCode || ""}"
                  required
                >
              </div>
              <div class="form-group">
                <label for="city">Miasto *</label>
                <input 
                  type="text" 
                  id="city" 
                  name="city" 
                  value="${this.checkoutData.city || ""}"
                  required
                >
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" onclick="app.navigateToPage('products')">
              <i class="fas fa-arrow-left"></i>
              Wróć do sklepu
            </button>
            <button type="submit" class="btn-primary">
              Dalej: Sposób dostawy
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </form>
      </div>
    `;
  }

  private renderShippingStep(): string {
    return `
      <div class="checkout-step" data-step="2">
        <div class="step-header">
          <h2 class="step-title">
            <i class="fas fa-truck"></i>
            Sposób dostawy
          </h2>
          <p class="step-subtitle">Wybierz najwygodniejszy sposób dostawy</p>
        </div>

        <form class="checkout-form" id="shipping-form">
          <div class="shipping-methods">
            <label class="shipping-method ${
              this.checkoutData.shippingMethod === "standard" ||
              !this.checkoutData.shippingMethod
                ? "selected"
                : ""
            }">
              <input 
                type="radio" 
                name="shippingMethod" 
                value="standard"
                ${
                  this.checkoutData.shippingMethod === "standard" ||
                  !this.checkoutData.shippingMethod
                    ? "checked"
                    : ""
                }
              >
              <div class="shipping-info">
                <div class="shipping-header">
                  <i class="fas fa-truck"></i>
                  <div class="shipping-details">
                    <h4>Dostawa standardowa</h4>
                    <p>2-3 dni robocze</p>
                  </div>
                </div>
                <div class="shipping-price">15.00 zł</div>
              </div>
            </label>

            <label class="shipping-method ${
              this.checkoutData.shippingMethod === "express" ? "selected" : ""
            }">
              <input 
                type="radio" 
                name="shippingMethod" 
                value="express"
                ${
                  this.checkoutData.shippingMethod === "express"
                    ? "checked"
                    : ""
                }
              >
              <div class="shipping-info">
                <div class="shipping-header">
                  <i class="fas fa-shipping-fast"></i>
                  <div class="shipping-details">
                    <h4>Dostawa express</h4>
                    <p>Następny dzień roboczy</p>
                  </div>
                </div>
                <div class="shipping-price">25.00 zł</div>
              </div>
            </label>

            <label class="shipping-method ${
              this.checkoutData.shippingMethod === "pickup" ? "selected" : ""
            }">
              <input 
                type="radio" 
                name="shippingMethod" 
                value="pickup"
                ${
                  this.checkoutData.shippingMethod === "pickup" ? "checked" : ""
                }
              >
              <div class="shipping-info">
                <div class="shipping-header">
                  <i class="fas fa-store"></i>
                  <div class="shipping-details">
                    <h4>Odbiór osobisty</h4>
                    <p>ul. Streetwear 123, Warszawa</p>
                  </div>
                </div>
                <div class="shipping-price">Gratis</div>
              </div>
            </label>
          </div>

          <div class="shipping-note">
            <i class="fas fa-info-circle"></i>
            <p><strong>Darmowa dostawa</strong> przy zamówieniach powyżej 200 zł (dotyczy dostawy standardowej)</p>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" onclick="checkoutPage.previousStep()">
              <i class="fas fa-arrow-left"></i>
              Wstecz
            </button>
            <button type="submit" class="btn-primary">
              Dalej: Płatność
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </form>
      </div>
    `;
  }

  private renderPaymentStep(): string {
    return `
      <div class="checkout-step" data-step="3">
        <div class="step-header">
          <h2 class="step-title">
            <i class="fas fa-credit-card"></i>
            Sposób płatności
          </h2>
          <p class="step-subtitle">Wybierz preferowaną metodę płatności</p>
        </div>

        <form class="checkout-form" id="payment-form">
          <div class="payment-methods">
            <label class="payment-method ${
              this.checkoutData.paymentMethod === "card" ||
              !this.checkoutData.paymentMethod
                ? "selected"
                : ""
            }">
              <input 
                type="radio" 
                name="paymentMethod" 
                value="card"
                ${
                  this.checkoutData.paymentMethod === "card" ||
                  !this.checkoutData.paymentMethod
                    ? "checked"
                    : ""
                }
              >
              <div class="payment-info">
                <div class="payment-header">
                  <i class="fas fa-credit-card"></i>
                  <div class="payment-details">
                    <h4>Karta płatnicza</h4>
                    <p>Visa, MasterCard, BLIK</p>
                  </div>
                </div>
                <div class="payment-badges">
                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA0MCAyNCI+PHBhdGggZmlsbD0iIzAwNTFBNSIgZD0iTTAgMGg0MHYyNEgwVjB6Ii8+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTggOGg4djhoLTh6Ii8+PC9zdmc+" alt="Visa">
                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA0MCAyNCI+PHBhdGggZmlsbD0iI0VCMDAxQiIgZD0iTTAgMGg0MHYyNEgwVjB6Ii8+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTggOGg4djhoLTh6Ii8+PC9zdmc+" alt="MasterCard">
                </div>
              </div>
            </label>

            <label class="payment-method ${
              this.checkoutData.paymentMethod === "transfer" ? "selected" : ""
            }">
              <input 
                type="radio" 
                name="paymentMethod" 
                value="transfer"
                ${
                  this.checkoutData.paymentMethod === "transfer"
                    ? "checked"
                    : ""
                }
              >
              <div class="payment-info">
                <div class="payment-header">
                  <i class="fas fa-university"></i>
                  <div class="payment-details">
                    <h4>Przelew bankowy</h4>
                    <p>Płatności24, PayU, Przelewy24</p>
                  </div>
                </div>
                <div class="payment-badges">
                  <span class="badge">PayU</span>
                  <span class="badge">P24</span>
                </div>
              </div>
            </label>

            <label class="payment-method ${
              this.checkoutData.paymentMethod === "cash" ? "selected" : ""
            }">
              <input 
                type="radio" 
                name="paymentMethod" 
                value="cash"
                ${this.checkoutData.paymentMethod === "cash" ? "checked" : ""}
              >
              <div class="payment-info">
                <div class="payment-header">
                  <i class="fas fa-money-bill-wave"></i>
                  <div class="payment-details">
                    <h4>Płatność przy odbiorze</h4>
                    <p>Gotówka lub karta u kuriera</p>
                  </div>
                </div>
                <div class="payment-note">
                  <small>+5.00 zł opłata za pobranie</small>
                </div>
              </div>
            </label>
          </div>

          <div class="payment-security">
            <div class="security-info">
              <i class="fas fa-shield-alt"></i>
              <div>
                <h4>Bezpieczne płatności</h4>
                <p>Twoje dane są chronione szyfrowaniem SSL 256-bit</p>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" onclick="checkoutPage.previousStep()">
              <i class="fas fa-arrow-left"></i>
              Wstecz
            </button>
            <button type="submit" class="btn-primary">
              Dalej: Podsumowanie
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </form>
      </div>
    `;
  }

  private renderConfirmationStep(): string {
    const items = cartService.getItems();
    const subtotal = cartService.getTotal();
    const shippingCost = this.calculateShippingCost();
    const paymentFee = this.checkoutData.paymentMethod === "cash" ? 5 : 0;
    const total = subtotal + shippingCost + paymentFee;

    return `
      <div class="checkout-step" data-step="4">
        <div class="step-header">
          <h2 class="step-title">
            <i class="fas fa-check-circle"></i>
            Podsumowanie zamówienia
          </h2>
          <p class="step-subtitle">Sprawdź dane zamówienia przed finalizacją</p>
        </div>

        <div class="order-confirmation">
          <div class="confirmation-section">
            <h3>Dane kontaktowe</h3>
            <div class="confirmation-data">
              <p><strong>${this.checkoutData.firstName} ${
      this.checkoutData.lastName
    }</strong></p>
              <p>${this.checkoutData.email}</p>
              <p>${this.checkoutData.phone}</p>
            </div>
            <button type="button" class="btn-edit" onclick="checkoutPage.goToStep(1)">
              <i class="fas fa-edit"></i> Edytuj
            </button>
          </div>

          <div class="confirmation-section">
            <h3>Adres dostawy</h3>
            <div class="confirmation-data">
              <p>${this.checkoutData.address}</p>
              <p>${this.checkoutData.postalCode} ${this.checkoutData.city}</p>
            </div>
            <button type="button" class="btn-edit" onclick="checkoutPage.goToStep(1)">
              <i class="fas fa-edit"></i> Edytuj
            </button>
          </div>

          <div class="confirmation-section">
            <h3>Sposób dostawy</h3>
            <div class="confirmation-data">
              <p><strong>${this.getShippingMethodName()}</strong></p>
              <p>Koszt: ${
                shippingCost === 0 ? "Gratis" : `${shippingCost.toFixed(2)} zł`
              }</p>
            </div>
            <button type="button" class="btn-edit" onclick="checkoutPage.goToStep(2)">
              <i class="fas fa-edit"></i> Edytuj
            </button>
          </div>

          <div class="confirmation-section">
            <h3>Sposób płatności</h3>
            <div class="confirmation-data">
              <p><strong>${this.getPaymentMethodName()}</strong></p>
              ${
                paymentFee > 0
                  ? `<p>Opłata za pobranie: ${paymentFee.toFixed(2)} zł</p>`
                  : ""
              }
            </div>
            <button type="button" class="btn-edit" onclick="checkoutPage.goToStep(3)">
              <i class="fas fa-edit"></i> Edytuj
            </button>
          </div>

          <div class="confirmation-section">
            <h3>Produkty (${items.length})</h3>
            <div class="confirmation-items">
              ${items
                .map(
                  (item) => `
                <div class="confirmation-item">
                  <img src="${item.image}" alt="${item.name}">
                  <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>Ilość: ${item.quantity}</p>
                  </div>
                  <div class="item-price">${(
                    item.price * item.quantity
                  ).toFixed(2)} zł</div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>

          <div class="confirmation-total">
            <div class="total-row">
              <span>Wartość produktów:</span>
              <span>${subtotal.toFixed(2)} zł</span>
            </div>
            <div class="total-row">
              <span>Dostawa:</span>
              <span>${
                shippingCost === 0 ? "Gratis" : `${shippingCost.toFixed(2)} zł`
              }</span>
            </div>
            ${
              paymentFee > 0
                ? `
            <div class="total-row">
              <span>Opłata za pobranie:</span>
              <span>${paymentFee.toFixed(2)} zł</span>
            </div>`
                : ""
            }
            <div class="total-row total-final">
              <span>Do zapłaty:</span>
              <span>${total.toFixed(2)} zł</span>
            </div>
          </div>

          <div class="terms-acceptance">
            <label class="checkbox-label">
              <input type="checkbox" id="acceptTerms" required>
              <span class="checkmark"></span>
              <span>Akceptuję <a href="#" target="_blank">regulamin</a> i <a href="#" target="_blank">politykę prywatności</a> *</span>
            </label>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" onclick="checkoutPage.previousStep()">
              <i class="fas fa-arrow-left"></i>
              Wstecz
            </button>
            <button type="button" class="btn-primary btn-large" onclick="checkoutPage.placeOrder()" id="place-order-btn">
              <i class="fas fa-lock"></i>
              Złóż zamówienie (${total.toFixed(2)} zł)
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private renderOrderSummary(): string {
    const items = cartService.getItems();
    const subtotal = cartService.getTotal();
    const shippingCost = this.calculateShippingCost();
    const paymentFee = this.checkoutData.paymentMethod === "cash" ? 5 : 0;
    const total = subtotal + shippingCost + paymentFee;

    return `
      <div class="order-summary">
        <h3 class="summary-title">
          <i class="fas fa-shopping-bag"></i>
          Podsumowanie koszyka
        </h3>
        
        <div class="summary-items">
          ${items
            .map(
              (item) => `
            <div class="summary-item">
              <img src="${item.image}" alt="${item.name}">
              <div class="item-details">
                <h4>${item.name}</h4>
                <span class="item-quantity">×${item.quantity}</span>
              </div>
              <div class="item-price">${(item.price * item.quantity).toFixed(
                2
              )} zł</div>
            </div>
          `
            )
            .join("")}
        </div>
        
        <div class="summary-totals">
          <div class="total-row">
            <span>Produkty:</span>
            <span>${subtotal.toFixed(2)} zł</span>
          </div>
          ${
            this.currentStep >= 2
              ? `
          <div class="total-row">
            <span>Dostawa:</span>
            <span>${
              shippingCost === 0 ? "Gratis" : `${shippingCost.toFixed(2)} zł`
            }</span>
          </div>`
              : ""
          }
          ${
            this.currentStep >= 3 && paymentFee > 0
              ? `
          <div class="total-row">
            <span>Pobranie:</span>
            <span>${paymentFee.toFixed(2)} zł</span>
          </div>`
              : ""
          }
          <div class="total-row total-final">
            <span>Razem:</span>
            <span>${total.toFixed(2)} zł</span>
          </div>
        </div>

        <div class="summary-features">
          <div class="feature">
            <i class="fas fa-shield-alt"></i>
            <span>Bezpieczne płatności</span>
          </div>
          <div class="feature">
            <i class="fas fa-undo"></i>
            <span>30 dni na zwrot</span>
          </div>
          <div class="feature">
            <i class="fas fa-truck"></i>
            <span>Darmowa dostawa od 200zł</span>
          </div>
        </div>
      </div>
    `;
  }

  private setupEventListeners(): void {
    // Form submissions
    const customerForm = document.getElementById("customer-info-form");
    const shippingForm = document.getElementById("shipping-form");
    const paymentForm = document.getElementById("payment-form");

    customerForm?.addEventListener(
      "submit",
      this.handleCustomerInfoSubmit.bind(this)
    );
    shippingForm?.addEventListener(
      "submit",
      this.handleShippingSubmit.bind(this)
    );
    paymentForm?.addEventListener(
      "submit",
      this.handlePaymentSubmit.bind(this)
    );

    // Shipping method selection
    const shippingMethods = document.querySelectorAll(
      'input[name="shippingMethod"]'
    );
    shippingMethods.forEach((radio) => {
      radio.addEventListener(
        "change",
        this.handleShippingMethodChange.bind(this)
      );
    });

    // Payment method selection
    const paymentMethods = document.querySelectorAll(
      'input[name="paymentMethod"]'
    );
    paymentMethods.forEach((radio) => {
      radio.addEventListener(
        "change",
        this.handlePaymentMethodChange.bind(this)
      );
    });

    // Make checkoutPage available globally for onclick handlers
    (window as any).checkoutPage = this;
  }

  private handleCustomerInfoSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // Validate form
    if (!this.validateCustomerInfo(formData)) {
      return;
    }

    // Save customer data
    this.checkoutData = {
      ...this.checkoutData,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      postalCode: formData.get("postalCode") as string,
      city: formData.get("city") as string,
    };

    this.nextStep();
  }

  private handleShippingSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    this.checkoutData.shippingMethod = formData.get("shippingMethod") as
      | "standard"
      | "express"
      | "pickup";
    this.checkoutData.shippingCost = this.calculateShippingCost();

    this.nextStep();
  }

  private handlePaymentSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    this.checkoutData.paymentMethod = formData.get("paymentMethod") as
      | "card"
      | "transfer"
      | "cash";

    this.nextStep();
  }

  private handleShippingMethodChange(event: Event): void {
    const target = event.target as HTMLInputElement;

    // Update visual selection
    const methods = document.querySelectorAll(".shipping-method");
    methods.forEach((method) => method.classList.remove("selected"));
    target.closest(".shipping-method")?.classList.add("selected");

    // Update data and re-render summary
    this.checkoutData.shippingMethod = target.value as
      | "standard"
      | "express"
      | "pickup";
    this.updateOrderSummary();
  }

  private handlePaymentMethodChange(event: Event): void {
    const target = event.target as HTMLInputElement;

    // Update visual selection
    const methods = document.querySelectorAll(".payment-method");
    methods.forEach((method) => method.classList.remove("selected"));
    target.closest(".payment-method")?.classList.add("selected");

    // Update data and re-render summary
    this.checkoutData.paymentMethod = target.value as
      | "card"
      | "transfer"
      | "cash";
    this.updateOrderSummary();
  }

  public nextStep(): void {
    if (this.currentStep < 4) {
      this.currentStep++;
      this.render();
      this.scrollToTop();
    }
  }

  public previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.render();
      this.scrollToTop();
    }
  }

  public goToStep(step: number): void {
    if (step >= 1 && step <= 4) {
      this.currentStep = step;
      this.render();
      this.scrollToTop();
    }
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  private updateOrderSummary(): void {
    const sidebar = document.querySelector(".checkout-sidebar");
    if (sidebar) {
      sidebar.innerHTML = this.renderOrderSummary();
    }
  }

  public async placeOrder(): Promise<void> {
    const termsCheckbox = document.getElementById(
      "acceptTerms"
    ) as HTMLInputElement;
    if (!termsCheckbox?.checked) {
      (window as any).app?.showNotification(
        "Musisz zaakceptować regulamin i politykę prywatności",
        "error"
      );
      return;
    }

    const btn = document.getElementById("place-order-btn") as HTMLButtonElement;
    const originalText = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Przetwarzanie zamówienia...';

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create customer info object
      const customerInfo: CustomerInfo = {
        firstName: this.checkoutData.firstName!,
        lastName: this.checkoutData.lastName!,
        email: this.checkoutData.email!,
        phone: this.checkoutData.phone!,
        address: this.checkoutData.address!,
        city: this.checkoutData.city!,
        postalCode: this.checkoutData.postalCode!,
        paymentMethod: this.checkoutData.paymentMethod!,
      };

      // Create order
      const items = cartService.getItems();
      const order = orderService.createOrder(items, customerInfo);

      // Clear cart
      cartService.clearCart();

      // Show success notification
      (window as any).app?.showNotification(
        "Zamówienie zostało złożone pomyślnie!",
        "success"
      );

      // Redirect to confirmation page
      window.location.hash = `#order-confirmation/${order.id}`;
    } catch (error) {
      console.error("Error placing order:", error);
      (window as any).app?.showNotification(
        "Wystąpił błąd podczas składania zamówienia. Spróbuj ponownie.",
        "error"
      );
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }

  private validateCustomerInfo(formData: FormData): boolean {
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const postalCode = formData.get("postalCode") as string;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      (window as any).app?.showNotification(
        "Nieprawidłowy format adresu email",
        "error"
      );
      return false;
    }

    // Phone validation (Polish format)
    const phoneRegex = /^(\+48\s?)?[\d\s\-\(\)]{9,}$/;
    if (!phoneRegex.test(phone)) {
      (window as any).app?.showNotification(
        "Nieprawidłowy format numeru telefonu",
        "error"
      );
      return false;
    }

    // Postal code validation (Polish format)
    const postalCodeRegex = /^\d{2}-\d{3}$/;
    if (!postalCodeRegex.test(postalCode)) {
      (window as any).app?.showNotification(
        "Nieprawidłowy format kodu pocztowego. Użyj formatu XX-XXX",
        "error"
      );
      return false;
    }

    return true;
  }

  private calculateShippingCost(): number {
    const subtotal = cartService.getTotal();
    const method = this.checkoutData.shippingMethod;

    if (method === "pickup") return 0;
    if (method === "express") return 25;
    if (subtotal >= 200) return 0; // Free shipping over 200 PLN
    return 15; // Standard shipping
  }

  private getShippingMethodName(): string {
    switch (this.checkoutData.shippingMethod) {
      case "standard":
        return "Dostawa standardowa (2-3 dni)";
      case "express":
        return "Dostawa express (następny dzień)";
      case "pickup":
        return "Odbiór osobisty";
      default:
        return "Dostawa standardowa (2-3 dni)";
    }
  }

  private getPaymentMethodName(): string {
    switch (this.checkoutData.paymentMethod) {
      case "card":
        return "Karta płatnicza";
      case "transfer":
        return "Przelew bankowy";
      case "cash":
        return "Płatność przy odbiorze";
      default:
        return "Karta płatnicza";
    }
  }
}
