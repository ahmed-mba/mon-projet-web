// Configuration de l'API
const API_URL = 'http://localhost:8000/api';
const token = localStorage.getItem('token');

class FavoritesManager {
    constructor() {
        this.destinations = [];
        this.favorites = [];
        this.initEventListeners();
        this.loadFavorites();
    }

    initEventListeners() {
        document.addEventListener('click', (e) => {
            const favoriteBtn = e.target.closest('.favorite-btn');
            if (favoriteBtn && token) {
                const destinationId = favoriteBtn.dataset.destinationId;
                this.toggleFavorite(parseInt(destinationId));
            }
        });
    }

    async loadFavorites() {
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/favorites`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                this.favorites = await response.json();
                this.updateFavoriteUI();
            }
        } catch (error) {
            console.error('Erreur de chargement des favoris:', error);
        }
    }

    async toggleFavorite(destinationId) {
        try {
            const method = this.isFavorite(destinationId) ? 'DELETE' : 'POST';
            const response = await fetch(`${API_URL}/favorites/${destinationId}`, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                await this.loadFavorites();
            }
        } catch (error) {
            console.error('Erreur lors de la modification des favoris:', error);
        }
    }

    isFavorite(destinationId) {
        return this.favorites.some(dest => dest.id === destinationId);
    }

    updateFavoriteUI() {
        const favoriteButtons = document.querySelectorAll('.favorite-btn');
        favoriteButtons.forEach(btn => {
            const destinationId = parseInt(btn.dataset.destinationId);
            btn.classList.toggle('favorite', this.isFavorite(destinationId));
        });
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.favoritesManager = new FavoritesManager();
});