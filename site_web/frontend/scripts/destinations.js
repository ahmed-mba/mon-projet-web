// Configuration de l'API
const API_URL = 'http://localhost:8000/api';
let token = localStorage.getItem('token');

// Fonctions utilitaires
function checkAuth() {
    token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth.html';
        return false;
    }
    return true;
}

// Gestion des destinations
class DestinationsManager {
    constructor() {
        this.destinations = [];
        this.initializeEventListeners();
        this.loadDestinations();
        this.updateAuthUI();
    }

    initializeEventListeners() {
        // Bouton d'ajout
        const addButton = document.getElementById('addDestinationBtn');
        if (addButton) {
            addButton.addEventListener('click', () => this.showModal());
        }

        // Formulaire
        const form = document.getElementById('destinationForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Fermeture du modal
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }

        // Recherche simple
        const searchInput = document.getElementById('destinationSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e));
        }

        // Menu hamburger
        const hamburger = document.getElementById('hamburger-menu');
        const navLinks = document.getElementById('nav-links');
        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                hamburger.classList.toggle('active');
            });
        }

        // Recherche avancée
        const toggleBtn = document.getElementById('toggleAdvanced');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleAdvancedSearch());
        }
        
        const applyBtn = document.getElementById('applyFilters');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applyFilters());
        }
        
        const resetBtn = document.getElementById('resetFilters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }
        
        const sortSelect = document.getElementById('sortBy');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => this.applyFilters());
        }
    }

    updateAuthUI() {
        const authLink = document.getElementById('authLink');
        if (authLink) {
            if (token) {
                authLink.textContent = 'Déconnexion';
                authLink.href = '#';
                authLink.onclick = () => {
                    localStorage.removeItem('token');
                    window.location.href = 'auth.html';
                };
            } else {
                authLink.textContent = 'Connexion';
                authLink.href = 'auth.html';
            }
        }
    }

    async loadDestinations() {
        try {
            const response = await fetch(`${API_URL}/destinations`);
            if (response.ok) {
                const data = await response.json();
                this.destinations = data;
                this.displayDestinations(data);
            } else {
                console.error('Erreur lors du chargement des destinations');
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    }

    displayDestinations(destinations) {
        const grid = document.getElementById('destinationsGrid');
        if (grid) {
            grid.innerHTML = '';

            if (destinations.length === 0) {
                grid.innerHTML = '<div class="no-results">Aucune destination trouvée</div>';
                return;
            }

            destinations.forEach(destination => {
                const card = this.createDestinationCard(destination);
                grid.appendChild(card);
            });
        }
    }

    createDestinationCard(destination) {
        const card = document.createElement('div');
        card.className = 'destination-card';
        card.innerHTML = `
            <div class="destination-image" style="background-image: url('${destination.image_url}')"></div>
            <div class="destination-info">
                <h3>${destination.name}</h3>
                <p>${destination.description}</p>
                <p>Pays: ${destination.country}</p>
                <p>Prix: ${destination.price}€</p>
                <p>Catégorie: ${destination.category}</p>
            </div>
            <div class="destination-controls">
                <button class="edit-btn" onclick="destinationsManager.editDestination(${destination.id})">Modifier</button>
                <button class="delete-btn" onclick="destinationsManager.deleteDestination(${destination.id})">Supprimer</button>
            </div>
        `;
        return card;
    }

    showModal(destination = null) {
        if (!checkAuth()) return;
        
        const modal = document.getElementById('destinationModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('destinationForm');

        if (modal && form) {
            modalTitle.textContent = destination ? 'Modifier la Destination' : 'Ajouter une Destination';
            
            if (destination) {
                form.dataset.id = destination.id;
                Object.keys(destination).forEach(key => {
                    const input = form.querySelector(`#${key}`);
                    if (input) input.value = destination[key];
                });
            } else {
                form.reset();
                delete form.dataset.id;
            }

            modal.style.display = 'block';
        }
    }

    hideModal() {
        const modal = document.getElementById('destinationModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        if (!checkAuth()) return;

        const form = e.target;
        const isEdit = form.dataset.id;
        const formData = new FormData(form);
        const destination = Object.fromEntries(formData.entries());

        try {
            const url = isEdit 
                ? `${API_URL}/destinations/${form.dataset.id}`
                : `${API_URL}/destinations`;
            
            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(destination)
            });

            if (response.ok) {
                this.hideModal();
                this.loadDestinations();
            } else {
                console.error('Erreur lors de la sauvegarde');
                alert('Erreur lors de la sauvegarde de la destination');
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            alert('Erreur de connexion au serveur');
        }
    }

    async editDestination(id) {
        if (!checkAuth()) return;
        
        try {
            const response = await fetch(`${API_URL}/destinations/${id}`);
            if (response.ok) {
                const destination = await response.json();
                this.showModal(destination);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    }

    async deleteDestination(id) {
        if (!checkAuth() || !confirm('Êtes-vous sûr de vouloir supprimer cette destination ?')) return;

        try {
            const response = await fetch(`${API_URL}/destinations/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                this.loadDestinations();
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    }

    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredDestinations = this.destinations.filter(destination => 
            destination.name.toLowerCase().includes(searchTerm) ||
            destination.description.toLowerCase().includes(searchTerm) ||
            destination.country.toLowerCase().includes(searchTerm)
        );
        this.displayDestinations(filteredDestinations);
    }

    // Méthode pour basculer le panneau de recherche avancée
    toggleAdvancedSearch() {
        const panel = document.getElementById('advancedSearch');
        const toggleIcon = document.querySelector('.toggle-icon');
        
        if (panel) {
            const isVisible = panel.style.display !== 'none';
            panel.style.display = isVisible ? 'none' : 'block';
            
            if (toggleIcon) {
                toggleIcon.textContent = isVisible ? '▼' : '▲';
            }
        }
    }

    // Méthode pour appliquer les filtres
    applyFilters() {
        const searchTerm = document.getElementById('destinationSearch')?.value.toLowerCase() || '';
        const minPrice = parseFloat(document.getElementById('minPrice')?.value) || 0;
        const maxPrice = parseFloat(document.getElementById('maxPrice')?.value) || Infinity;
        
        // Récupérer les catégories sélectionnées
        const categoryCheckboxes = document.querySelectorAll('input[name="category"]:checked');
        const selectedCategories = Array.from(categoryCheckboxes).map(cb => cb.value);
        
        // Récupérer l'option de tri
        const sortBy = document.getElementById('sortBy')?.value || '';
        
        // Filtrer les destinations
        let filteredDestinations = this.destinations.filter(destination => {
            // Filtrer par texte
            const textMatch = destination.name.toLowerCase().includes(searchTerm) || 
                            destination.description.toLowerCase().includes(searchTerm) ||
                            destination.country.toLowerCase().includes(searchTerm);
            
            // Filtrer par prix
            const priceMatch = destination.price >= minPrice && 
                              (maxPrice === Infinity || destination.price <= maxPrice);
            
            // Filtrer par catégorie
            const categoryMatch = selectedCategories.length === 0 || 
                                 selectedCategories.includes(destination.category);
            
            return textMatch && priceMatch && categoryMatch;
        });
        
        // Trier les destinations
        if (sortBy) {
            switch (sortBy) {
                case 'price-asc':
                    filteredDestinations.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    filteredDestinations.sort((a, b) => b.price - a.price);
                    break;
                case 'name-asc':
                    filteredDestinations.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name-desc':
                    filteredDestinations.sort((a, b) => b.name.localeCompare(a.name));
                    break;
            }
        }
        
        // Afficher les résultats
        this.displayDestinations(filteredDestinations);
    }

    // Méthode pour réinitialiser les filtres
    resetFilters() {
        // Réinitialiser les champs
        const searchInput = document.getElementById('destinationSearch');
        if (searchInput) searchInput.value = '';
        
        const minPrice = document.getElementById('minPrice');
        if (minPrice) minPrice.value = '';
        
        const maxPrice = document.getElementById('maxPrice');
        if (maxPrice) maxPrice.value = '';
        
        const sortSelect = document.getElementById('sortBy');
        if (sortSelect) sortSelect.value = '';
        
        // Décocher toutes les catégories
        const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
        categoryCheckboxes.forEach(cb => cb.checked = false);
        
        // Afficher toutes les destinations
        this.displayDestinations(this.destinations);
    }
}

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    window.destinationsManager = new DestinationsManager();
});