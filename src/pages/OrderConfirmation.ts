import { orderService } from "../services/orders";
import type { Order } from "../types";

export class OrderConfirmationPage {
  private order: Order | null = null;

  public render(orderId: string): void {
    const mainContent = document.getElementById("mainContent")!; // Get order from service
    this.order = orderService.getOrderById(orderId) || null;

    if (!this.order) {
      mainContent.innerHTML = `
        <div class="order-confirmation-container">
          <div class="container">
            <div class="order-error">
              <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <h1 class="error-title">Zamówienie nie znalezione</h1>
              <p class="error-subtitle">Nie można znaleźć zamówienia o podanym numerze</p>
              <button class="btn-primary" onclick="app.navigateToPage('')">
                <i class="fas fa-home"></i>
                Powrót do strony głównej
              </button>
            </div>
          </div>
        </div>
      `;
      return;
    }

    mainContent.innerHTML = `
      <div class="order-confirmation-container">
        <div class="container">
          <div class="confirmation-header">
            <div class="success-animation">
              <div class="checkmark">
                <i class="fas fa-check"></i>
              </div>
            </div>
            <h1 class="confirmation-title">Dziękujemy za zamówienie!</h1>
            <p class="confirmation-subtitle">Twoje zamówienie zostało pomyślnie złożone</p>
          </div>

          <div class="confirmation-content">
            <div class="order-details-section">
              ${this.renderOrderDetails()}
            </div>
            
            <div class="next-steps-section">
              ${this.renderNextSteps()}
            </div>
          </div>

          <div class="confirmation-actions">
            <button class="btn-primary" onclick="app.navigateToPage('')">
              <i class="fas fa-home"></i>
              Powrót do strony głównej
            </button>
            <button class="btn-secondary" onclick="app.navigateToPage('products')">
              <i class="fas fa-shopping-bag"></i>
              Kontynuuj zakupy
            </button>
            <button class="btn-outline" onclick="window.print()">
              <i class="fas fa-print"></i>
              Wydrukuj potwierdzenie
            </button>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  private renderOrderDetails(): string {
    if (!this.order) return "";

    const shippingCost = this.calculateShippingCost();
    const paymentFee = this.order.customer.paymentMethod === "cash" ? 5 : 0;
    const subtotal = this.order.total - shippingCost - paymentFee;

    return `
      <div class="order-details-card">
        <div class="card-header">
          <h2 class="card-title">
            <i class="fas fa-receipt"></i>
            Szczegóły zamówienia
          </h2>
          <div class="order-number">
            <span class="label">Numer zamówienia:</span>
            <span class="number">${this.order.id}</span>
          </div>
        </div>

        <div class="order-info-grid">
          <div class="info-section">
            <h3>Dane kontaktowe</h3>
            <div class="info-content">
              <p><strong>${this.order.customer.firstName} ${
      this.order.customer.lastName
    }</strong></p>
              <p><i class="fas fa-envelope"></i> ${
                this.order.customer.email
              }</p>
              <p><i class="fas fa-phone"></i> ${this.order.customer.phone}</p>
            </div>
          </div>

          <div class="info-section">
            <h3>Adres dostawy</h3>
            <div class="info-content">
              <p>${this.order.customer.address}</p>
              <p>${this.order.customer.postalCode} ${
      this.order.customer.city
    }</p>
            </div>
          </div>

          <div class="info-section">
            <h3>Sposób płatności</h3>
            <div class="info-content">
              <p><strong>${this.getPaymentMethodName()}</strong></p>
              ${
                paymentFee > 0
                  ? `<p class="payment-fee">Opłata za pobranie: ${paymentFee.toFixed(
                      2
                    )} zł</p>`
                  : ""
              }
            </div>
          </div>

          <div class="info-section">
            <h3>Status zamówienia</h3>
            <div class="info-content">
              <span class="status-badge status-${this.order.status}">
                <i class="fas fa-clock"></i>
                ${this.getStatusName()}
              </span>
              <p class="order-date">
                <i class="fas fa-calendar"></i>
                ${this.formatDate(this.order.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div class="ordered-items">
          <h3>Zamówione produkty (${this.order.items.length})</h3>
          <div class="items-list">
            ${this.order.items
              .map(
                (item) => `
              <div class="order-item">
                <img src="${item.image}" alt="${item.name}" class="item-image">
                <div class="item-info">
                  <h4 class="item-name">${item.name}</h4>
                  <p class="item-category">${item.category}</p>
                  <div class="item-quantity">Ilość: ${item.quantity}</div>
                </div>
                <div class="item-pricing">
                  <div class="unit-price">${item.price.toFixed(
                    2
                  )} zł / szt.</div>
                  <div class="total-price">${(
                    item.price * item.quantity
                  ).toFixed(2)} zł</div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <div class="order-summary">
          <div class="summary-row">
            <span>Wartość produktów:</span>
            <span>${subtotal.toFixed(2)} zł</span>
          </div>
          <div class="summary-row">
            <span>Dostawa:</span>
            <span>${
              shippingCost === 0 ? "Gratis" : `${shippingCost.toFixed(2)} zł`
            }</span>
          </div>
          ${
            paymentFee > 0
              ? `
          <div class="summary-row">
            <span>Opłata za pobranie:</span>
            <span>${paymentFee.toFixed(2)} zł</span>
          </div>`
              : ""
          }
          <div class="summary-row summary-total">
            <span>Razem do zapłaty:</span>
            <span>${this.order.total.toFixed(2)} zł</span>
          </div>
        </div>
      </div>
    `;
  }

  private renderNextSteps(): string {
    const paymentMethod = this.order?.customer.paymentMethod;

    return `
      <div class="next-steps-card">
        <div class="card-header">
          <h2 class="card-title">
            <i class="fas fa-route"></i>
            Co dalej?
          </h2>
        </div>

        <div class="steps-timeline">
          <div class="timeline-step completed">
            <div class="step-icon">
              <i class="fas fa-check"></i>
            </div>
            <div class="step-content">
              <h4>Zamówienie złożone</h4>
              <p>Twoje zamówienie zostało przyjęte do realizacji</p>
              <span class="step-time">Teraz</span>
            </div>
          </div>

          <div class="timeline-step ${
            paymentMethod === "transfer" ? "pending" : "upcoming"
          }">
            <div class="step-icon">
              <i class="fas fa-credit-card"></i>
            </div>
            <div class="step-content">
              <h4>Płatność</h4>
              <p>${this.getPaymentStepDescription()}</p>
              <span class="step-time">${
                paymentMethod === "transfer" ? "Oczekuje" : "Przy odbiorze"
              }</span>
            </div>
          </div>

          <div class="timeline-step upcoming">
            <div class="step-icon">
              <i class="fas fa-box"></i>
            </div>
            <div class="step-content">
              <h4>Przygotowanie zamówienia</h4>
              <p>Pakujemy Twoje produkty z najwyższą starannością</p>
              <span class="step-time">1-2 dni robocze</span>
            </div>
          </div>

          <div class="timeline-step upcoming">
            <div class="step-icon">
              <i class="fas fa-truck"></i>
            </div>
            <div class="step-content">
              <h4>Wysyłka</h4>
              <p>Zamówienie zostanie przekazane do dostawy</p>
              <span class="step-time">2-3 dni robocze</span>
            </div>
          </div>

          <div class="timeline-step upcoming">
            <div class="step-icon">
              <i class="fas fa-home"></i>
            </div>
            <div class="step-content">
              <h4>Dostawa</h4>
              <p>Otrzymasz swoje zamówienie pod wskazanym adresem</p>
              <span class="step-time">3-5 dni roboczych</span>
            </div>
          </div>
        </div>

        <div class="contact-info">
          <h4>
            <i class="fas fa-headset"></i>
            Masz pytania?
          </h4>
          <p>Skontaktuj się z nami w sprawie swojego zamówienia</p>
          <div class="contact-methods">
            <a href="mailto:zamowienia@blvnt.pl" class="contact-method">
              <i class="fas fa-envelope"></i>
              zamowienia@blvnt.pl
            </a>
            <a href="tel:+48123456789" class="contact-method">
              <i class="fas fa-phone"></i>
              +48 123 456 789
            </a>
          </div>
        </div>

        <div class="social-follow">
          <h4>
            <i class="fas fa-users"></i>
            Śledź nas
          </h4>
          <p>Bądź na bieżąco z nowościami i promocjami</p>
          <div class="social-links">
            <a href="#" class="social-link instagram">
              <i class="fab fa-instagram"></i>
              @blvnt.streetwear
            </a>
            <a href="#" class="social-link tiktok">
              <i class="fab fa-tiktok"></i>
              @blvnt_official
            </a>
            <a href="#" class="social-link facebook">
              <i class="fab fa-facebook"></i>
              BLVNT Streetwear
            </a>
          </div>
        </div>
      </div>
    `;
  }

  private setupEventListeners(): void {
    // Add any interactive functionality here
    this.setupEmailConfirmationResend();
  }

  private setupEmailConfirmationResend(): void {
    const resendBtn = document.getElementById("resend-confirmation");
    resendBtn?.addEventListener("click", () => {
      if (this.order) {
        // Simulate email resend
        (window as any).app?.showNotification(
          "Email potwierdzający został wysłany ponownie",
          "success"
        );
      }
    });
  }

  private calculateShippingCost(): number {
    if (!this.order) return 0;

    const subtotal = this.order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // This should match the checkout calculation logic
    if (subtotal >= 200) return 0; // Free shipping over 200 PLN
    return 15; // Standard shipping cost
  }

  private getPaymentMethodName(): string {
    if (!this.order) return "";

    switch (this.order.customer.paymentMethod) {
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

  private getPaymentStepDescription(): string {
    if (!this.order) return "";

    switch (this.order.customer.paymentMethod) {
      case "card":
        return "Płatność została zrealizowana kartą płatniczą";
      case "transfer":
        return "Oczekujemy na wpłatę przelewem bankowym";
      case "cash":
        return "Płatność przy odbiorze u kuriera";
      default:
        return "Płatność została zrealizowana";
    }
  }

  private getStatusName(): string {
    if (!this.order) return "";

    switch (this.order.status) {
      case "pending":
        return "Oczekuje na realizację";
      case "confirmed":
        return "Potwierdzone";
      case "shipped":
        return "Wysłane";
      case "delivered":
        return "Dostarczone";
      default:
        return "W trakcie realizacji";
    }
  }

  private formatDate(date: Date): string {
    const orderDate = new Date(date);
    return orderDate.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
