import { SalesEventHub } from "./messages";
import { EntityStore } from "./meta-store";

export class BackendService {
  private hub = new SalesEventHub();
  private entityStore = new EntityStore();

  private constructor() {
    this.hub.connect();
    this.hub.registerSalesEventListener(event => this.saleEventHistory.push(event));
  }


  private saleEventHistory: SalesEvent[] = [];
  public registerSalesEventListener(listener: SaleEventCallback, summary: boolean = true) {
    // If the caller needs a history of all past saleEvents
    // Then send them before registering in the salesEventHub
    // So that the caller recieves them in the correct order
    if(summary) this.saleEventHistory.forEach((event) => listener(event));

    // Pass the listener through to the salesEventHub
    this.hub.registerSalesEventListener(listener);
  }

  private userCache = new Map<number, User>();
  public async getUser(id: number): Promise<User> {
    // Try to find the User from the cache, and return if found
    const cachedUser = this.userCache.get(id);
    if(cachedUser) return cachedUser;

    // Otherwise fetch the User, save it to the cache, and return it
    const fetchedUser = await this.entityStore.getUser(id);
    this.userCache.set(id, fetchedUser);
    return fetchedUser;
  }

  private productCache = new Map<number, Product>();
  public async getProduct(id: number): Promise<Product> {
    // Try to find the Product from the cache, and return if found
    const cachedProduct = this.productCache.get(id);
    if(cachedProduct) return cachedProduct;

    // Otherwise fetch the Product, save it to the cache, and return it
    const fetchedProduct = await this.entityStore.getProduct(id);
    this.productCache.set(id, fetchedProduct);
    return fetchedProduct;
  }

  // Singleton statics
  private static singletonInstance?: BackendService;
  public static get Instance(): BackendService {
    // If the class hasn't been instantiated, then do it
    if (!this.singletonInstance) this.singletonInstance = new this();
    return this.singletonInstance;
  }
}

// Interfaces
interface SalesEvent {
  type: 'sale';
  userId: number;
  productId: number;
  duration: number;
}

interface SaleEventCallback {
  (event: SalesEvent): void;
}

interface User {
	type: 'user';
	id: number;
	name: string;
}

interface Product {
	type: 'product';
	id: number;
	name: string;
	unitPrice: number;
}