export interface User {
    id: number;
    name: string;
    email: string;
    type: 'admin' | 'employee' | 'customer';
    phone?: string;
    document_number?: string;
    is_active: boolean;
}

export interface AuthResponse {
    user: User;
    token: string;
}
