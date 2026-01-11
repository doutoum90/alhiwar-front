import { apiFetch } from './api';
export const authorService = {
    // Authors endpoints
  async getAuthors() {
    return apiFetch('/api/authors');
  },

  async searchAuthors(query: string) {
    return apiFetch(`/api/authors/search?q=${encodeURIComponent(query)}`);
  },

  async getAuthorsStatistics() {
    return apiFetch('/api/authors/statistics');
  },

  async getAuthor(id: string) {
    return apiFetch(`/api/authors/${id}`);
  },

  async createAuthor(authorData: any) {
    return apiFetch('/api/authors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authorData)
    });
  },

  async updateAuthor(id: string, authorData: any) {
    return apiFetch(`/api/authors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authorData)
    });
  },

  async changeAuthorPassword(id: string, passwordData: any) {
    return apiFetch(`/api/authors/${id}/change-password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(passwordData)
    });
  },

  async toggleAuthorStatus(id: string) {
    return apiFetch(`/api/authors/${id}/toggle-status`, {
      method: 'PATCH'
    });
  },

  async suspendAuthor(id: string) {
    return apiFetch(`/api/authors/${id}/suspend`, {
      method: 'PATCH'
    });
  },

  async activateAuthor(id: string) {
    return apiFetch(`/api/authors/${id}/activate`, {
      method: 'PATCH'
    });
  },

  async deleteAuthor(id: string) {
    return apiFetch(`/api/authors/${id}`, {
      method: 'DELETE'
    });
  },
}