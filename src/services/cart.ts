import type { Product, CartItem } from "../types";

export class CartService {
  private items: CartItem[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadCart();
  }

  // Subskrypcja na zmiany w koszyku
  subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback());
  }

  addItem(product: Product): void {
    const existingItem = this.items.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }

    this.saveCart();
    this.notifyListeners();
  }

  removeItem(productId: number): void {
    this.items = this.items.filter((item) => item.id !== productId);
    this.saveCart();
    this.notifyListeners();
  }

  updateQuantity(productId: number, quantity: number): void {
    const item = this.items.find((item) => item.id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = quantity;
        this.saveCart();
        this.notifyListeners();
      }
    }
  }

  getItems(): CartItem[] {
    return [...this.items];
  }

  getTotal(): number {
    return this.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  getItemCount(): number {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  clearCart(): void {
    this.items = [];
    this.saveCart();
    this.notifyListeners();
  }
  private saveCart(): void {
    localStorage.setItem("blvnt-cart", JSON.stringify(this.items));
  }
  private loadCart(): void {
    const savedCart = localStorage.getItem("blvnt-cart");
    if (savedCart) {
      try {
        this.items = JSON.parse(savedCart);
      } catch (error) {
        console.error("Error loading cart:", error);
        this.items = [];
      }
    }
  }
}

// Singleton instance
export const cartService = new CartService();
