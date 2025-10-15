export interface Product {
    id: number;
    category_id: number;
    name: string;
    slug: string;
    description?: string;
    price: number;
    cost_price: number;
    current_stock: number;
    min_stock: number;
    sku: string;
    barcode?: string;
    is_active: boolean;
    featured: boolean;
    images?: string[];
    category?: Category;
    low_stock?: boolean;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    is_active: boolean;
    products_count?: number;
}