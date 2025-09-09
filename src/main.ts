import "./style.css";
import { products } from "./services/products";
import { cartService } from "./services/cart";
import { CartComponent } from "./components/Cart";
import { CheckoutPage } from "./pages/Checkout";
import { OrderConfirmationPage } from "./pages/OrderConfirmation";
import type { Product } from "./types";

class BLVNTApp {
  private cartComponent: CartComponent;
  private checkoutPage: CheckoutPage | null = null;
  private orderConfirmationPage: OrderConfirmationPage | null = null;
  private filteredProducts: Product[] = products;
  private searchTerm: string = "";
  private wishlist: Set<number> = new Set();

  // Route mapping
  private routes: { [key: string]: string } = {
    "": "home",
    home: "home",
    "strona-glowna": "home",
    onas: "about",
    "o-nas": "about",
    about: "about",
    kontakt: "contact",
    contact: "contact",
    koszyk: "checkout",
    checkout: "checkout",
  };

  private getRouteByPage(page: string): string {
    // Map page names to URL paths
    const pageToRoute: { [key: string]: string } = {
      home: "",
      about: "onas",
      contact: "kontakt",
      checkout: "koszyk",
    };
    return pageToRoute[page] || "";
  }

  constructor() {
    this.cartComponent = new CartComponent();
    this.init();
  }

  private init(): void {
    this.setupDOM();
    this.setupEventListeners();
    this.renderProducts();
    this.updateCartDisplay();
    this.setupRouting();
    this.setupKeyboardNavigation();

    // Subscribe to cart updates
    cartService.subscribe(() => {
      this.updateCartDisplay();
    });

    // Handle initial route
    if (window.location.hash) {
      this.handleHashChange();
    } else {
      this.handleRouteChange();
    }
  }

  private setupDOM(): void {
    const app = document.querySelector<HTMLDivElement>("#app")!;

    app.innerHTML = `
      <!-- Header -->
      <header class="header">
        <div class="container">
          <div class="nav-brand">
            <h1>BLVNT</h1>
            <span class="tagline">Urban Style Revolution</span>
          </div>
          <nav class="nav">
            <button class="nav-btn" data-page="home">Strona Główna</button>
            <button class="nav-btn" data-page="about">O Nas</button>
            <button class="nav-btn" data-page="contact">Kontakt</button>
            <button class="search-btn" id="searchBtn">🔍</button>
            <button class="cart-btn" id="cartBtn">
              🛒 <span class="cart-count" id="cartCount">0</span>
            </button>
          </nav>

          <!-- Mobile menu toggle (visible only on small screens via CSS) -->
          <button class="mobile-menu-toggle" id="mobileToggle" aria-label="Menu mobilne" aria-expanded="false" aria-controls="mobileNav">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <!-- Mobile nav (slides down when active) -->
      <div class="mobile-nav" id="mobileNav" aria-hidden="true">
        <div class="mobile-nav-list">
          <button class="mobile-nav-item" data-page="home">Strona Główna</button>
          <button class="mobile-nav-item" data-page="about">O Nas</button>
          <button class="mobile-nav-item" data-page="contact">Kontakt</button>
          <button class="mobile-nav-item" data-page="checkout">Koszyk</button>
        </div>
      </div>

      <!-- Floating search button for mobile when header is hidden -->
      <button id="mobileSearchFloat" class="mobile-search-floating" aria-label="Szukaj mobilnie" style="display:none">🔍</button>

      <!-- Search Modal -->
      <div class="modal-overlay" id="searchModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Szukaj produktów</h2>
            <button class="modal-close" id="searchClose">&times;</button>
          </div>
          <div class="modal-body">
            <input type="text" id="searchInput" placeholder="Wpisz nazwę produktu..." class="search-input">
            <div class="search-results" id="searchResults"></div>
          </div>
        </div>
      </div>

      <!-- Cart Modal -->
      <div class="modal-overlay cart-modal" id="cartModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Koszyk</h2>
            <button class="modal-close" id="cartClose">&times;</button>
          </div>
          <div class="modal-body" id="cartContent"></div>
        </div>
      </div>

      <!-- Product Quick View Modal -->
      <div class="modal-overlay quickview-modal" id="quickviewModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Podgląd produktu</h2>
            <button class="modal-close" id="quickviewClose">&times;</button>
          </div>
          <div class="modal-body" id="quickviewContent"></div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="main" id="mainContent">
        <!-- Content will be dynamically loaded based on current page -->
      </main>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-section">
              <h3>BLVNT</h3>
              <p>Rewolucja w miejskim stylu. Wysokiej jakości streetwear dla nowoczesnych ludzi.</p>
              <div class="social-links">
                <a href="#" class="social-link">Instagram</a>
                <a href="#" class="social-link">TikTok</a>
                <a href="#" class="social-link">Facebook</a>
              </div>
            </div>
            <div class="footer-section">
              <h4>Kategorie</h4>
              <ul class="footer-links">
                <li><a href="#" data-category="koszulki">Koszulki</a></li>
                <li><a href="#" data-category="bluzy">Bluzy</a></li>
                <li><a href="#" data-category="spodnie">Spodnie</a></li>
                <li><a href="#" data-category="akcesoria">Akcesoria</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h4>Pomoc</h4>
              <ul class="footer-links">
                <li><a href="#" data-page="contact">Kontakt</a></li>
                <li><a href="#">Dostawa i zwroty</a></li>
                <li><a href="#">Tabela rozmiarów</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h4>Newsletter</h4>
              <p>Bądź na bieżąco z najnowszymi trendami</p>
              <div class="newsletter">
                <input type="email" placeholder="Twój email" class="newsletter-input">
                <button class="newsletter-btn">Subskrybuj</button>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2025 BLVNT. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    `;
  }

  private setupEventListeners(): void {
    // Navigation
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const page = (e.target as HTMLElement).dataset.page!;
        this.navigateToRoute(this.getRouteByPage(page));
      });
    });

    // Footer navigation
    document.querySelectorAll("[data-page]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const page = (e.target as HTMLElement).dataset.page!;
        this.navigateToRoute(this.getRouteByPage(page));
      });
    });

    // Category filters in footer
    document.querySelectorAll("[data-category]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const category = (e.target as HTMLElement).dataset.category!;
        this.navigateToRoute("");
        setTimeout(() => {
          this.filterByCategory(category);
        }, 100);
      });
    });

    // Cart button
    document.getElementById("cartBtn")?.addEventListener("click", () => {
      this.showCart();
    });

    // Search functionality
    document.getElementById("searchBtn")?.addEventListener("click", () => {
      this.showSearchModal();
    });

    document.getElementById("searchClose")?.addEventListener("click", () => {
      this.hideSearchModal();
    });

    document.getElementById("searchInput")?.addEventListener("input", (e) => {
      const term = (e.target as HTMLInputElement).value;
      this.searchProducts(term);
    });

    // Cart modal
    document.getElementById("cartClose")?.addEventListener("click", () => {
      this.hideCart();
    });

    // Quick view modal
    document.getElementById("quickviewClose")?.addEventListener("click", () => {
      this.hideQuickView();
    });

    // Close modals on outside click
    window.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("modal-overlay")) {
        if (target.id === "cartModal") {
          this.hideCart();
        } else if (target.id === "searchModal") {
          this.hideSearchModal();
        } else if (target.id === "quickviewModal") {
          this.hideQuickView();
        }
      }
    });

    // Newsletter
    document.querySelector(".newsletter-btn")?.addEventListener("click", () => {
      const input = document.querySelector(
        ".newsletter-input"
      ) as HTMLInputElement;
      if (input.value) {
        this.showNotification("Dziękujemy za subskrypcję!", "success");
        input.value = "";
      }
    });

    // Mobile menu toggle
    document.getElementById("mobileToggle")?.addEventListener("click", () => {
      const btn = document.getElementById("mobileToggle")!;
      const nav = document.getElementById("mobileNav")!;
      const header = document.querySelector<HTMLElement>(".header");
      const floatSearch = document.getElementById("mobileSearchFloat");
      const isActive = nav.classList.toggle("active");
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-expanded", String(isActive));
      nav.setAttribute("aria-hidden", String(!isActive));
      // Lock body scroll when menu is open
      document.body.classList.toggle("no-scroll", isActive);
      // On small screens hide the fixed header to avoid double chrome
      if (header && window.matchMedia("(max-width: 920px)").matches) {
        header.classList.toggle("hidden", isActive);
      }
      // Show floating search button when header is hidden (so only search remains visible)
      if (floatSearch) {
        floatSearch.style.display = isActive ? "flex" : "none";
      }
    });

    // Mobile nav item clicks
    document.querySelectorAll(".mobile-nav-item").forEach((item) => {
      item.addEventListener("click", (ev) => {
        ev.preventDefault();
        const page = (ev.target as HTMLElement).dataset.page!;
        // Navigate and close mobile menu
        this.navigateToRoute(this.getRouteByPage(page));
        const nav = document.getElementById("mobileNav");
        const toggle = document.getElementById("mobileToggle");
        nav?.classList.remove("active");
        toggle?.classList.remove("active");
        toggle?.setAttribute("aria-expanded", "false");
        nav?.setAttribute("aria-hidden", "true");
        document.body.classList.remove("no-scroll");
        document.querySelector(".header")?.classList.remove("hidden");
        // hide floating search
        document
          .getElementById("mobileSearchFloat")
          ?.style.setProperty("display", "none");
      });
    });

    // Close mobile nav when tapping outside (on small screens)
    window.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const nav = document.getElementById("mobileNav");
      const toggle = document.getElementById("mobileToggle");
      const floatSearch = document.getElementById("mobileSearchFloat");
      if (!nav || !toggle) return;
      if (!nav.classList.contains("active")) return;
      if (target.closest(".mobile-nav") || target.closest("#mobileToggle"))
        return;
      // clicked outside -> close
      nav.classList.remove("active");
      toggle.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
      nav.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
      document.querySelector(".header")?.classList.remove("hidden");
      if (floatSearch) floatSearch.style.display = "none";
    });

    // Mobile floating search opens search modal
    document
      .getElementById("mobileSearchFloat")
      ?.addEventListener("click", () => {
        this.showSearchModal();
      });
  }

  private setupRouting(): void {
    // Listen for popstate events (back/forward buttons)
    window.addEventListener("popstate", () => {
      this.handleRouteChange();
    });

    // Listen for hash changes for order confirmation
    window.addEventListener("hashchange", () => {
      this.handleHashChange();
    });
  }

  private handleRouteChange(): void {
    const path = window.location.pathname.substring(1); // Remove leading slash
    const route = this.routes[path] || "home";
    this.navigateToPage(route, false); // false = don't push to history
  }

  private handleHashChange(): void {
    const hash = window.location.hash.substring(1); // Remove # symbol

    if (hash.startsWith("order-confirmation/")) {
      const orderId = hash.replace("order-confirmation/", "");
      this.renderOrderConfirmationPage(orderId);
    }
  }

  private navigateToRoute(path: string): void {
    const route = this.routes[path] || "home";

    // Update URL without triggering page refresh
    const newUrl = path === "home" || path === "" ? "/" : `/${path}`;
    if (window.location.pathname !== newUrl) {
      window.history.pushState({ route }, "", newUrl);
    }

    this.navigateToPage(route, false);
  }

  private navigateToPage(page: string, pushToHistory: boolean = true): void {
    // Smooth scroll to top when changing pages
    this.scrollToTop();

    // Update active nav button
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(`[data-page="${page}"]`)?.classList.add("active");

    // Add loading state
    this.showPageLoadingState();

    if (pushToHistory) {
      this.navigateToRoute(page);
    }

    // Small delay for smooth transition effect
    setTimeout(() => {
      switch (page) {
        case "home":
          this.renderHomePage();
          break;
        case "about":
          this.renderAboutPage();
          break;
        case "contact":
          this.renderContactPage();
          break;
        case "checkout":
          this.renderCheckoutPage();
          break;
        default:
          this.renderHomePage();
      }

      // Remove loading state
      this.hidePageLoadingState();
    }, 150);
  }

  private renderHomePage(): void {
    const mainContent = document.getElementById("mainContent")!;

    mainContent.innerHTML = `
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <h1 class="hero-title">BLVNT 2025</h1>
          <p class="hero-subtitle">Odkryj najnowsze trendy w streetwear</p>
          <button class="hero-btn" onclick="document.getElementById('products').scrollIntoView()">
            Kolekcja
          </button>
        </div>
        <div class="hero-video">
          <div class="video-placeholder">
            <span>🎬 Prezentacja Kolekcji 2025</span>
          </div>
        </div>
      </section>

      <!-- Featured Products -->
      <section class="featured">
        <div class="container">
          <h2 class="section-title">Polecane Produkty</h2>
          <div class="featured-grid" id="featuredGrid">
            <!-- Featured products will be rendered here -->
          </div>
        </div>
      </section>

      <!-- About Preview -->
      <section class="about-preview">
        <div class="container">
          <div class="about-preview-content">
            <div class="about-preview-text">
              <h2>O BLVNT</h2>
              <p>Jesteśmy polską marką streetwear, która łączy urban style z najwyższą jakością wykonania. Nasze produkty to efekt pasji do mody ulicznej i dbałości o każdy szczegół.</p>
              <button class="btn-secondary" data-page="about">Poznaj nas lepiej</button>
            </div>
            <div class="about-preview-stats">
              <div class="stat">
                <h3>1000+</h3>
                <p>Zadowolonych klientów</p>
              </div>
              <div class="stat">
                <h3>50+</h3>
                <p>Unikalnych produktów</p>
              </div>
              <div class="stat">
                <h3>24/7</h3>
                <p>Obsługa klienta</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Lookbook -->
      <section class="lookbook" aria-labelledby="lookbook-heading">
        <div class="container">
          <h2 id="lookbook-heading" class="section-title">Lookbook</h2>
          <div class="lookbook-grid">
            <figure class="lookbook-item" tabindex="0" aria-label="Urban Casual – Codzienny streetwear">
              <div class="lookbook-media">
                <img loading="lazy" src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&h=1000&fit=crop" alt="Model w stylu Urban Casual" />
                <figcaption class="lookbook-overlay">
                  <h3>Urban Casual</h3>
                  <p>Codzienny streetwear</p>
                </figcaption>
              </div>
            </figure>
            <figure class="lookbook-item" tabindex="0" aria-label="Tech Wear – Futurystyczny styl">
              <div class="lookbook-media">
                <img loading="lazy" src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop" alt="Model w stylu Tech Wear" />
                <figcaption class="lookbook-overlay">
                  <h3>Premium Basics</h3>
                  <p>Wysokiej jakości klasyka</p>
                </figcaption>
              </div>
            </figure>
            <figure class="lookbook-item" tabindex="0" aria-label="Minimalist – Czysty design">
              <div class="lookbook-media">
                <img loading="lazy" src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=1000&fit=crop" alt="Model w minimalistycznym stroju" />
                <figcaption class="lookbook-overlay">
                  <h3>Minimalist</h3>
                  <p>Czysty design</p>
                </figcaption>
              </div>
            </figure>
          </div>
        </div>
      </section>

      <!-- Products Section -->
      <section class="products" id="products">
        <div class="container">
          <h2 class="section-title">Nasze Produkty</h2>
          
          <!-- Filters -->
          <div class="filters">
            <button class="filter-btn active" data-category="wszystkie">Wszystkie</button>
            <button class="filter-btn" data-category="koszulki">Koszulki</button>
            <button class="filter-btn" data-category="bluzy">Bluzy</button>
            <button class="filter-btn" data-category="spodnie">Spodnie</button>
            <button class="filter-btn" data-category="sukienki">Sukienki</button>
            <button class="filter-btn" data-category="kurtki">Kurtki</button>
            <button class="filter-btn" data-category="akcesoria">Akcesoria</button>
            <button class="filter-btn" data-category="buty">Buty</button>
          </div>

          <div class="products-grid" id="productsGrid">
            <!-- Products will be rendered here -->
          </div>
        </div>
      </section>
    `;

    this.setupHomePageEventListeners();
    this.renderFeaturedProducts();
    this.renderProducts();
  }

  private setupHomePageEventListeners(): void {
    // Category filters
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const category = (e.target as HTMLElement).dataset.category!;
        this.filterByCategory(category);

        // Update active filter
        document
          .querySelectorAll(".filter-btn")
          .forEach((b) => b.classList.remove("active"));
        (e.target as HTMLElement).classList.add("active");
      });
    });

    // About preview button
    document
      .querySelector('[data-page="about"]')
      ?.addEventListener("click", (e) => {
        e.preventDefault();
        this.navigateToRoute("onas");
      });
  }

  private renderFeaturedProducts(): void {
    const featuredGrid = document.getElementById("featuredGrid");
    if (!featuredGrid) return;

    const featuredProducts = products.slice(0, 4); // First 4 products as featured

    featuredGrid.innerHTML = featuredProducts
      .map(
        (product) => `
      <div class="featured-card" onclick="app.openProductModal(${
        product.id
      })" style="cursor: pointer;">
        <div class="featured-image">
          <img src="${product.image}" alt="${product.name}">
          <button class="wishlist-btn ${
            this.wishlist.has(product.id) ? "active" : ""
          }" 
                  onclick="event.stopPropagation(); app.toggleWishlist(${
                    product.id
                  })">♥</button>
        </div>
        <div class="featured-info">
          <h3>${product.name}</h3>
          <p class="featured-price">${product.price.toFixed(2)} zł</p>
          <p class="product-click-hint">Kliknij aby wybrać rozmiar</p>
        </div>
      </div>
    `
      )
      .join("");
  }

  private renderProducts(): void {
    const productsGrid = document.getElementById("productsGrid");
    if (!productsGrid) return;

    productsGrid.innerHTML = this.filteredProducts
      .map(
        (product) => `
      <div class="product-card" onclick="app.openProductModal(${
        product.id
      })" style="cursor: pointer;">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}">
          <div class="product-overlay">
            <button class="quick-view-btn" onclick="event.stopPropagation(); app.showQuickView(${
              product.id
            })">
              Szybki podgląd
            </button>
            <button class="wishlist-btn ${
              this.wishlist.has(product.id) ? "active" : ""
            }" 
                    onclick="event.stopPropagation(); app.toggleWishlist(${
                      product.id
                    })">♥</button>
          </div>
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-footer">
            <span class="product-price">${product.price.toFixed(2)} zł</span>
            <p class="product-click-hint">Kliknij aby wybrać rozmiar</p>
          </div>
        </div>
      </div>
    `
      )
      .join("");
  }

  private renderAboutPage(): void {
    const mainContent = document.getElementById("mainContent")!;

    mainContent.innerHTML = `
      <section class="about-hero">
        <div class="container">
          <h1>O BLVNT</h1>
          <p class="about-subtitle">Polska marka streetwear z pasją do miejskiego stylu</p>
        </div>
      </section>

      <section class="about-content">
        <div class="container">
          <div class="about-story">
            <div class="about-text">
              <h2>Nasza Historia</h2>
              <p>BLVNT powstało z pasji do streetwear i chęci stworzenia czegoś wyjątkowego na polskim rynku. Jesteśmy młodą marką, która łączy nowoczesne trendy z wysoką jakością wykonania.</p>
              <p>Nasze produkty to nie tylko ubrania - to sposób wyrażenia siebie, manifestacja stylu i przynależności do społeczności ludzi ceniących urban fashion.</p>
              <p>Każdy element naszej kolekcji jest starannie przemyślany i wykonany z dbałością o najmniejsze szczegóły.</p>
            </div>
            <div class="about-image">
              <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&h=600&fit=crop" alt="BLVNT Team">
            </div>
          </div>

          <div class="about-values">
            <h2>Nasze Wartości</h2>
            <div class="values-grid">
              <div class="value-item">
                <div class="value-icon">🎨</div>
                <h3>Kreatywność</h3>
                <p>Tworzymy unikalne designs inspirowane kulturą uliczną i najnowszymi trendami.</p>
              </div>
              <div class="value-item">
                <div class="value-icon">⭐</div>
                <h3>Jakość</h3>
                <p>Używamy tylko najlepszych materiałów i dbamy o każdy detal w procesie produkcji.</p>
              </div>
              <div class="value-item">
                <div class="value-icon">🌍</div>
                <h3>Odpowiedzialność</h3>
                <p>Działamy etycznie i dbamy o środowisko w każdym aspekcie naszej działalności.</p>
              </div>
              <div class="value-item">
                <div class="value-icon">👥</div>
                <h3>Społeczność</h3>
                <p>Budujemy społeczność ludzi dzielących pasję do streetwear i miejskiego stylu.</p>
              </div>
            </div>
          </div>

          <div class="about-stats">
            <div class="stats-grid">
              <div class="stat-item">
                <h3>2023</h3>
                <p>Rok założenia</p>
              </div>
              <div class="stat-item">
                <h3>1000+</h3>
                <p>Zadowolonych klientów</p>
              </div>
              <div class="stat-item">
                <h3>50+</h3>
                <p>Produktów w ofercie</p>
              </div>
              <div class="stat-item">
                <h3>24/7</h3>
                <p>Obsługa klienta</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  private renderContactPage(): void {
    const mainContent = document.getElementById("mainContent")!;

    mainContent.innerHTML = `
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
                <div class="contact-icon">📧</div>
                <div class="contact-details">
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

    this.setupContactFormListener();
  }

  private renderCheckoutPage(): void {
    if (!this.checkoutPage) {
      this.checkoutPage = new CheckoutPage();
    }
    this.checkoutPage.render();
  }

  private renderOrderConfirmationPage(orderId: string): void {
    if (!this.orderConfirmationPage) {
      this.orderConfirmationPage = new OrderConfirmationPage();
    }
    this.orderConfirmationPage.render(orderId);
  }

  private setupContactFormListener(): void {
    const form = document.getElementById("contactForm");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.showNotification(
        "Dziękujemy za wiadomość! Odpowiemy najszybciej jak to możliwe.",
        "success"
      );
      (e.target as HTMLFormElement).reset();
    });
  }

  private filterByCategory(category: string): void {
    if (category === "wszystkie") {
      this.filteredProducts = products.filter(
        (product) =>
          product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredProducts = products.filter(
        (product) =>
          product.category === category &&
          product.category === category &&
          (product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            product.description
              .toLowerCase()
              .includes(this.searchTerm.toLowerCase()))
      );
    }

    this.renderProducts();
  }

  private searchProducts(term: string): void {
    this.searchTerm = term;
    const searchResults = document.getElementById("searchResults");

    if (!searchResults) return;

    if (term.length < 2) {
      searchResults.innerHTML =
        '<p class="search-hint">Wpisz co najmniej 2 znaki</p>';
      return;
    }

    const results = products.filter(
      (product) =>
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.description.toLowerCase().includes(term.toLowerCase()) ||
        product.category.toLowerCase().includes(term.toLowerCase())
    );

    if (results.length === 0) {
      searchResults.innerHTML =
        '<p class="no-results">Nie znaleziono produktów</p>';
      return;
    }

    searchResults.innerHTML = results
      .map(
        (product) => `
      <div class="search-result-item" onclick="app.selectSearchResult(${
        product.id
      })">
        <img src="${product.image}" alt="${
          product.name
        }" class="search-result-image">
        <div class="search-result-info">
          <h4>${product.name}</h4>
          <p class="search-result-price">${product.price.toFixed(2)} zł</p>
        </div>
      </div>
    `
      )
      .join("");
  }

  public selectSearchResult(productId: number): void {
    this.hideSearchModal();
    this.showQuickView(productId);
  }

  public showQuickView(productId: number): void {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const modal = document.getElementById("quickviewModal")!;
    const content = document.getElementById("quickviewContent")!;

    content.innerHTML = `
      <div class="quickview-product">
        <div class="quickview-image">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="quickview-info">
          <h2>${product.name}</h2>
          <p class="quickview-price">${product.price.toFixed(2)} zł</p>
          <p class="quickview-description">${product.description}</p>
          <div class="quickview-category">
            <span class="category-tag">${product.category}</span>
          </div>
          <div class="quickview-actions">
            <button class="btn-primary" onclick="app.addToCart(${product.id})">
              Dodaj do koszyka
            </button>
            <button class="wishlist-btn ${
              this.wishlist.has(product.id) ? "active" : ""
            }" 
                    onclick="app.toggleWishlist(${product.id})">
              ${
                this.wishlist.has(product.id)
                  ? "♥ Usuń z ulubionych"
                  : "♡ Dodaj do ulubionych"
              }
            </button>
          </div>
        </div>
      </div>
    `;

    modal.style.display = "block";
  }

  private hideQuickView(): void {
    const modal = document.getElementById("quickviewModal")!;
    modal.style.display = "none";
  }

  private showSearchModal(): void {
    const modal = document.getElementById("searchModal")!;
    modal.classList.add("active");
    const input = document.getElementById("searchInput") as HTMLInputElement;
    input.focus();
  }

  private hideSearchModal(): void {
    const modal = document.getElementById("searchModal")!;
    modal.classList.remove("active");
    const input = document.getElementById("searchInput") as HTMLInputElement;
    input.value = "";
    document.getElementById("searchResults")!.innerHTML = "";
  }

  private showCart(): void {
    const modal = document.getElementById("cartModal")!;
    const content = document.getElementById("cartContent")!;

    this.cartComponent.renderModal(content);

    modal.classList.add("active");
  }

  private hideCart(): void {
    const modal = document.getElementById("cartModal")!;
    modal.classList.remove("active");
  }

  public addToCart(productId: number): void {
    const product = products.find((p) => p.id === productId);
    if (product) {
      cartService.addItem(product);

      // Show enhanced notification
      this.showNotification(`${product.name} dodano do koszyka!`, "success");
    }
  }

  public openProductModal(productId: number): void {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const modal = document.createElement("div");
    modal.className = "product-modal";
    modal.innerHTML = `
      <div class="product-modal-backdrop" onclick="this.closest('.product-modal').remove()"></div>
      <div class="product-modal-content">
        <button class="product-modal-close" onclick="this.closest('.product-modal').remove()">&times;</button>
        <div class="product-modal-grid">
          <div class="product-modal-image">
            <img src="${product.image}" alt="${product.name}">
          </div>
          <div class="product-modal-info">
            <h2 class="product-modal-name">${product.name}</h2>
            <p class="product-modal-description">${product.description}</p>
            <p class="product-modal-price">${product.price.toFixed(2)} zł</p>
            
            <div class="size-selection">
              <h3>Wybierz rozmiar:</h3>
              <div class="size-options">
                <button class="size-btn" data-size="S">S</button>
                <button class="size-btn" data-size="M">M</button>
                <button class="size-btn" data-size="L">L</button>
                <button class="size-btn" data-size="XL">XL</button>
                <button class="size-btn" data-size="XXL">XXL</button>
              </div>
            </div>
            
            <button class="btn-primary add-to-cart-final" disabled onclick="app.addToCartWithSize(${productId}, this)">
              Dodaj do koszyka
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Setup size selection
    const sizeButtons = modal.querySelectorAll(".size-btn");
    const addToCartBtn = modal.querySelector(
      ".add-to-cart-final"
    ) as HTMLButtonElement;

    sizeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        sizeButtons.forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        addToCartBtn.disabled = false;
      });
    });
  }

  public addToCartWithSize(
    productId: number,
    buttonElement: HTMLElement
  ): void {
    const modal = buttonElement.closest(".product-modal");
    const selectedSize = modal?.querySelector(".size-btn.selected");

    if (!selectedSize) {
      this.showNotification("Wybierz rozmiar!", "error");
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (product) {
      // Create product with size
      const productWithSize = {
        ...product,
        size: selectedSize.getAttribute("data-size"),
      };

      cartService.addItem(productWithSize);
      this.showNotification(
        `${product.name} (rozmiar ${selectedSize.getAttribute(
          "data-size"
        )}) dodano do koszyka!`,
        "success"
      );

      // Close modal
      modal?.remove();
    }
  }

  public toggleWishlist(productId: number): void {
    if (this.wishlist.has(productId)) {
      this.wishlist.delete(productId);
    } else {
      this.wishlist.add(productId);
    }

    // Update wishlist buttons
    document
      .querySelectorAll(`[onclick*="toggleWishlist(${productId})"]`)
      .forEach((btn) => {
        btn.classList.toggle("active");
        if (btn.textContent?.includes("Usuń")) {
          btn.textContent = btn.textContent.replace(
            "♥ Usuń z ulubionych",
            "♡ Dodaj do ulubionych"
          );
        } else if (btn.textContent?.includes("Dodaj")) {
          btn.textContent = btn.textContent.replace(
            "♡ Dodaj do ulubionych",
            "♥ Usuń z ulubionych"
          );
        }
      });
  }

  private updateCartDisplay(): void {
    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
      const totalItems = cartService
        .getItems()
        .reduce((sum, item) => sum + item.quantity, 0);
      cartCount.textContent = totalItems.toString();

      // Add animation
      cartCount.style.transform = "scale(1.2)";
      setTimeout(() => {
        cartCount.style.transform = "scale(1)";
      }, 200);
    }
  }

  public goToCheckout(): void {
    this.hideCart();
    this.navigateToRoute("koszyk");
  }

  public updateCartModal(): void {
    const content = document.getElementById("cartContent");
    if (content) {
      this.cartComponent.renderModal(content);
    }
  }

  // Enhanced Navigation Methods
  private scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  private showPageLoadingState(): void {
    const mainContent = document.getElementById("mainContent");
    if (mainContent) {
      mainContent.style.opacity = "0.7";
      mainContent.style.transition = "opacity 0.15s ease";
      mainContent.style.pointerEvents = "none";
    }
  }

  private hidePageLoadingState(): void {
    const mainContent = document.getElementById("mainContent");
    if (mainContent) {
      mainContent.style.opacity = "1";
      mainContent.style.pointerEvents = "auto";
    }
  }

  // Enhanced User Experience Methods
  public showNotification(
    message: string,
    type: "success" | "error" | "info" = "success"
  ): void {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add("show"), 10);

    // Auto remove after 4 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.classList.remove("show");
        setTimeout(() => notification.remove(), 300);
      }
    }, 4000);
  }

  // Improved Search with History
  public performAdvancedSearch(query: string, category?: string): Product[] {
    let results = products;

    // Filter by category if specified
    if (category && category !== "wszystkie") {
      results = results.filter((product) => product.category === category);
    }

    // Search in name, description, and tags
    if (query && query.length >= 2) {
      const searchTerm = query.toLowerCase();
      results = results.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm)
      );
    }

    return results;
  }

  // Keyboard Navigation Support
  private setupKeyboardNavigation(): void {
    document.addEventListener("keydown", (e) => {
      // ESC key closes modals
      if (e.key === "Escape") {
        if (
          document.getElementById("cartModal")?.classList.contains("active")
        ) {
          this.hideCart();
        } else if (
          document.getElementById("searchModal")?.classList.contains("active")
        ) {
          this.hideSearchModal();
        } else if (
          document.getElementById("quickviewModal")?.style.display === "block"
        ) {
          this.hideQuickView();
        }
      }

      // Ctrl/Cmd + K opens search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        this.showSearchModal();
      }

      // Navigation shortcuts
      if (e.altKey) {
        switch (e.key) {
          case "h":
            e.preventDefault();
            this.navigateToRoute("");
            break;
          case "a":
            e.preventDefault();
            this.navigateToRoute("onas");
            break;
          case "c":
            e.preventDefault();
            this.navigateToRoute("kontakt");
            break;
          case "k":
            e.preventDefault();
            this.navigateToRoute("koszyk");
            break;
        }
      }
    });
  }
}

// Initialize the app
const app = new BLVNTApp();

// Make app and cartService globally available for onclick handlers
(window as any).app = app;
(window as any).cartService = cartService;
