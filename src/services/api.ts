const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  errors?: Array<{ msg: string; param: string }>;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    
    if (!response.ok) {
      // If unauthorized, clear token and redirect to login
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.reload();
      }
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    return this.handleResponse<{ token: string; user: any }>(response);
  }

  async register(name: string, email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    
    return this.handleResponse<{ token: string; user: any }>(response);
  }

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<{ user: any }>(response);
  }

  // Expense endpoints
  async getExpenses(filters?: {
    category?: string;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/expenses?${params}`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<any[]>(response);
  }

  async createExpense(expense: {
    amount: number;
    category: string;
    date: string;
    paymentMethod: string;
    notes?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(expense)
    });
    
    return this.handleResponse<any>(response);
  }

  async updateExpense(id: string, expense: Partial<{
    amount: number;
    category: string;
    date: string;
    paymentMethod: string;
    notes?: string;
  }>) {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(expense)
    });
    
    return this.handleResponse<any>(response);
  }

  async deleteExpense(id: string) {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<{ message: string }>(response);
  }

  // Budget endpoints
  async getBudgets(month?: string) {
    const params = month ? `?month=${month}` : '';
    const response = await fetch(`${API_BASE_URL}/budgets${params}`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<any[]>(response);
  }

  async createBudget(budget: {
    category: string;
    amount: number;
    month: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/budgets`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(budget)
    });
    
    return this.handleResponse<any>(response);
  }

  async updateBudget(id: string, budget: Partial<{
    amount: number;
  }>) {
    const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(budget)
    });
    
    return this.handleResponse<any>(response);
  }

  async deleteBudget(id: string) {
    const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<{ message: string }>(response);
  }

  // Health check
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return this.handleResponse<{ message: string; timestamp: string }>(response);
  }
}

export const apiService = new ApiService();