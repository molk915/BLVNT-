import type { Order, CartItem, CustomerInfo } from "../types";

export class OrderService {
  private orders: Order[] = [];

  constructor() {
    this.loadOrders();
  }

  createOrder(items: CartItem[], customer: CustomerInfo): Order {
    const order: Order = {
      id: this.generateOrderId(),
      items: [...items],
      customer: { ...customer },
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: "pending",
      createdAt: new Date(),
    };

    this.orders.push(order);
    this.saveOrders();

    // Symulacja wysłania emaila
    this.sendOrderConfirmationEmail(order);

    return order;
  }

  getOrders(): Order[] {
    return [...this.orders];
  }

  getOrderById(orderId: string): Order | undefined {
    return this.orders.find((order) => order.id === orderId);
  }

  updateOrderStatus(orderId: string, status: Order["status"]): boolean {
    const order = this.orders.find((order) => order.id === orderId);
    if (order) {
      order.status = status;
      this.saveOrders();
      return true;
    }
    return false;
  }

  private generateOrderId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 9);
    return `MW-${timestamp.slice(-6)}-${random.toUpperCase()}`;
  }

  private sendOrderConfirmationEmail(order: Order): void {
    // Symulacja wysłania emaila
    console.log(`📧 Email confirmation sent to ${order.customer.email}`);
    console.log(`Order ID: ${order.id}`);
    console.log(`Total: ${order.total.toFixed(2)} zł`);
  }

  private saveOrders(): void {
    localStorage.setItem("maciuswear-orders", JSON.stringify(this.orders));
  }

  private loadOrders(): void {
    const savedOrders = localStorage.getItem("maciuswear-orders");
    if (savedOrders) {
      try {
        this.orders = JSON.parse(savedOrders).map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt),
        }));
      } catch (error) {
        console.error("Error loading orders:", error);
        this.orders = [];
      }
    }
  }
}

export const orderService = new OrderService();
