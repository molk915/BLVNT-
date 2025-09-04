export class ContactComponent {
  constructor() {}

  public render(container: HTMLElement): void {
    container.innerHTML = `
      <section class="contact-hero">
        <div class="container">
          <h1>Kontakt</h1>
          <p class="contact-subtitle">Masz pytania? Skontaktuj się z nami!</p>
        </div>
      </section>

      <section class="contact-content">
        <div class="container">
          <div class="contact-grid">
            <div class="contact-info">
              <h2>Informacje kontaktowe</h2>
              
              <div class="contact-item">
                <div class="contact-icon">📧</div>                <div class="contact-details">
                  <h3>Email</h3>
                  <p>kontakt@blvnt.pl</p>
                  <p>sklep@blvnt.pl</p>
                </div>
              </div>

              <div class="contact-item">
                <div class="contact-icon">📱</div>
                <div class="contact-details">
                  <h3>Telefon</h3>
                  <p>+48 123 456 789</p>
                  <p>Pon-Pt: 9:00-17:00</p>
                </div>
              </div>

              <div class="contact-item">
                <div class="contact-icon">📍</div>
                <div class="contact-details">
                  <h3>Adres</h3>
                  <p>ul. Streetwear 123</p>
                  <p>00-001 Warszawa</p>
                </div>
              </div>

              <div class="contact-item">
                <div class="contact-icon">💬</div>
                <div class="contact-details">
                  <h3>Social Media</h3>
                  <div class="social-links">
                    <a href="#" class="social-link">Instagram</a>
                    <a href="#" class="social-link">TikTok</a>
                    <a href="#" class="social-link">Facebook</a>
                  </div>
                </div>
              </div>
            </div>

            <div class="contact-form-container">
              <h2>Napisz do nas</h2>
              <form class="contact-form" id="contactForm">
                <div class="form-group">
                  <label for="contactName">Imię i nazwisko *</label>
                  <input type="text" id="contactName" name="name" required>
                </div>

                <div class="form-group">
                  <label for="contactEmail">Email *</label>
                  <input type="email" id="contactEmail" name="email" required>
                </div>

                <div class="form-group">
                  <label for="contactPhone">Telefon</label>
                  <input type="tel" id="contactPhone" name="phone">
                </div>

                <div class="form-group">
                  <label for="contactSubject">Temat *</label>
                  <select id="contactSubject" name="subject" required>
                    <option value="">Wybierz temat</option>
                    <option value="order">Pytanie o zamówienie</option>
                    <option value="product">Pytanie o produkt</option>
                    <option value="return">Zwrot/reklamacja</option>
                    <option value="cooperation">Współpraca</option>
                    <option value="other">Inne</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="contactMessage">Wiadomość *</label>
                  <textarea id="contactMessage" name="message" rows="5" required></textarea>
                </div>

                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" required>
                    <span class="checkmark"></span>
                    Zgadzam się na przetwarzanie danych osobowych *
                  </label>
                </div>

                <button type="submit" class="btn-primary">Wyślij wiadomość</button>
              </form>
            </div>
          </div>

          <div class="contact-faq">
            <h2>Często zadawane pytania</h2>
            <div class="faq-grid">
              <div class="faq-item">
                <h3>Jak długo trwa dostawa?</h3>
                <p>Standardowa dostawa trwa 2-3 dni robocze. Oferujemy również dostawę express w 24h.</p>
              </div>
              <div class="faq-item">
                <h3>Czy mogę zwrócić produkt?</h3>
                <p>Tak, masz 14 dni na zwrot produktu bez podania przyczyny. Produkt musi być w stanie nienaruszonym.</p>
              </div>
              <div class="faq-item">
                <h3>Jak sprawdzić rozmiar?</h3>
                <p>Na stronie każdego produktu znajdziesz tabelę rozmiarów. W razie wątpliwości skontaktuj się z nami.</p>
              </div>
              <div class="faq-item">
                <h3>Czy oferujecie wysyłkę za granicę?</h3>
                <p>Tak, wysyłamy do wszystkich krajów UE. Koszt i czas dostawy zależą od kraju docelowego.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    const form = document.getElementById("contactForm");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleFormSubmit(e.target as HTMLFormElement);
    });
  }

  private handleFormSubmit(form: HTMLFormElement): void {
    // In a real app, you would send this data to a server
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    console.log("Contact form submitted:", data);

    // Show success message
    alert("Dziękujemy za wiadomość! Odpowiemy najszybciej jak to możliwe.");

    // Reset form
    form.reset();
  }
}
