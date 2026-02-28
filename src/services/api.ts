// =============================================================
// 前端 API 服务层 - 统一封装所有后端 API 调用
// =============================================================

const API_BASE = '/api';

// Token 管理
function getToken(): string | null {
    return localStorage.getItem('access_token');
}

export function setToken(token: string) {
    localStorage.setItem('access_token', token);
}

export function clearToken() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
}

export function setRefreshToken(token: string) {
    localStorage.setItem('refresh_token', token);
}

// 通用请求方法
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || `请求失败 (${res.status})`);
    }

    return data as T;
}

// =============================================================
// Auth API
// =============================================================

export interface AuthResponse {
    user: any;
    session: {
        access_token: string;
        refresh_token: string;
    } | null;
}

export async function apiRegister(email: string, password: string, name?: string): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
    });

    if (data.session) {
        setToken(data.session.access_token);
        setRefreshToken(data.session.refresh_token);
    }

    return data;
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    if (data.session) {
        setToken(data.session.access_token);
        setRefreshToken(data.session.refresh_token);
    }

    return data;
}

export async function apiLogout(): Promise<void> {
    try {
        await request('/auth/logout', { method: 'POST' });
    } finally {
        clearToken();
    }
}

export async function apiGetMe(): Promise<{ user: { id: string; email: string } }> {
    return request('/auth/me');
}

// =============================================================
// Profile API
// =============================================================

export interface ProfileData {
    id: string;
    name: string;
    avatar: string;
    membership: string;
    language: string;
}

export async function apiGetProfile(): Promise<ProfileData> {
    return request<ProfileData>('/profile');
}

export async function apiUpdateProfile(profile: Partial<ProfileData>): Promise<ProfileData> {
    return request<ProfileData>('/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
    });
}

// =============================================================
// Account API
// =============================================================

export interface AccountData {
    id: string;
    name: string;
    nameEn: string;
    type: string;
    balance: number;
    icon: string;
    color: string;
    description?: string;
    status?: string;
}

export async function apiGetAccounts(): Promise<AccountData[]> {
    return request<AccountData[]>('/accounts');
}

export async function apiCreateAccount(account: Omit<AccountData, 'id'>): Promise<AccountData> {
    return request<AccountData>('/accounts', {
        method: 'POST',
        body: JSON.stringify(account),
    });
}

export async function apiUpdateAccount(id: string, account: Partial<AccountData>): Promise<AccountData> {
    return request<AccountData>(`/accounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(account),
    });
}

export async function apiDeleteAccount(id: string): Promise<void> {
    await request(`/accounts/${id}`, { method: 'DELETE' });
}

// =============================================================
// Transaction API
// =============================================================

export interface TransactionData {
    id: string;
    type: 'expense' | 'income';
    amount: number;
    category: string;
    categoryIcon: string;
    categoryColor: string;
    date: string;
    time: string;
    account: string;
    note: string;
}

export async function apiGetTransactions(): Promise<TransactionData[]> {
    return request<TransactionData[]>('/transactions');
}

export async function apiCreateTransaction(tx: Omit<TransactionData, 'id' | 'time'>): Promise<TransactionData> {
    return request<TransactionData>('/transactions', {
        method: 'POST',
        body: JSON.stringify(tx),
    });
}

export async function apiUpdateTransaction(id: string, tx: Partial<TransactionData>): Promise<TransactionData> {
    return request<TransactionData>(`/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(tx),
    });
}

export async function apiDeleteTransaction(id: string): Promise<void> {
    await request(`/transactions/${id}`, { method: 'DELETE' });
}
