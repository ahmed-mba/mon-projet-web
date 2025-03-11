// Configuration de l'API
const API_URL = 'http://localhost:8000/api';
let token = localStorage.getItem('token');

// Coordonnées par défaut (Paris)
const DEFAULT_LAT = 48.856614;
const DEFAULT_LNG = 2.352222;
const DEFAULT_ZOOM = 5;

class MapManager {
    constructor() {
        this.destinations = [];
        this.markers = [];
        this.initMap();
        this.loadDestinations();
        this.initEventListeners();
        this.updateAuthUI();
    }

    initMap() {
        // Initialiser la carte
        this.map = L.map('map').setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM);

        // Ajouter la couche de tuiles OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    }

    async loadDestinations() {
        try {
            const response = await fetch(`${API_URL}/destinations`);
            if (response.ok) {
                const data = await response.json();
                this.destinations = data;
                this.displayDestinationsList();
                this.addMarkersToMap();
            } else {
                console.error('Erreur lors du chargement des destinations');
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    }

    displayDestinationsList() {
        const listContainer = document.getElementById('destinationsList');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';

        this.destinations.forEach(destination => {
            const item = document.createElement('div');
            item.className = 'destination-item';
            item.textContent = destination.name;
            item.dataset.id = destination.id;
            item.addEventListener('click', () => this.focusDestination(destination.id));
            listContainer.appendChild(item);
        });
    }

    addMarkersToMap() {
        // Coordonnées réelles pour les principales villes
        const coordinates = {
            'paris': [48.856614, 2.352222],
            'londres': [51.507351, -0.127758],
            'rome': [41.902782, 12.496366],
            'bali': [-8.409518, 115.188919],
            'new york': [40.712776, -74.005974],
            'tokyo': [35.689487, 139.691711],
            'marrakech': [31.629472, -7.981084]
        };

        this.destinations.forEach(destination => {
            // Rechercher les coordonnées par le nom ou le pays
            let coords;
            const name = destination.name.toLowerCase();
            const country = destination.country.toLowerCase();
            
            // Essayer de trouver par nom
            if (coordinates[name]) {
                coords = coordinates[name];
            } 
            // Sinon utiliser le pays comme repère
            else if (country === 'france') {
                coords = [46.603354, 1.888334]; // Centre de la France
            } else if (country === 'italie') {
                coords = [41.902782, 12.496366]; // Rome
            } else if (country === 'espagne') {
                coords = [40.463667, -3.749220]; // Madrid
            } else if (country === 'indonésie') {
                coords = [-8.409518, 115.188919]; // Bali
            } else {
                // Coordonnées par défaut en Europe
                coords = [48.856614, 2.352222];
            }

            // Créer un marqueur
            const marker = L.marker(coords).addTo(this.map);
            
            // Popup avec les infos
            marker.bindPopup(`
                <div class="map-popup">
                    <h3>${destination.name}</h3>
                    <p>${destination.country}</p>
                    <p>${destination.description.substring(0, 100)}${destination.description.length > 100 ? '...' : ''}</p>
                    <p>Prix: ${destination.price}€</p>
                    <a href="destinations.html" class="popup-link">Voir détails</a>
                </div>
            `);

            this.markers.push({ id: destination.id, marker });
        });
    }

    focusDestination(id) {
        // Trouver le marqueur correspondant
        const markerItem = this.markers.find(item => item.id === parseInt(id));
        if (markerItem) {
            // Centrer la carte sur le marqueur et ouvrir la popup
            this.map.setView(markerItem.marker.getLatLng(), 8);
            markerItem.marker.openPopup();

            // Mettre en évidence l'élément dans la liste
            document.querySelectorAll('.destination-item').forEach(item => {
                item.classList.remove('active');
                if (parseInt(item.dataset.id) === parseInt(id)) {
                    item.classList.add('active');
                    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        }
    }

    initEventListeners() {
        // Recherche sur la carte
        const searchInput = document.getElementById('mapSearch');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleMapSearch.bind(this));
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
    }

    handleMapSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const listContainer = document.getElementById('destinationsList');
        if (!listContainer) return;
        
        // Filtrer les destinations
        const filteredDestinations = this.destinations.filter(destination => 
            destination.name.toLowerCase().includes(searchTerm) ||
            destination.country.toLowerCase().includes(searchTerm)
        );

        // Mettre à jour la liste
        listContainer.innerHTML = '';
        
        if (filteredDestinations.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = 'Aucun résultat trouvé';
            listContainer.appendChild(noResults);
            return;
        }

        filteredDestinations.forEach(destination => {
            const item = document.createElement('div');
            item.className = 'destination-item';
            item.textContent = destination.name;
            item.dataset.id = destination.id;
            item.addEventListener('click', () => this.focusDestination(destination.id));
            listContainer.appendChild(item);
        });
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
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.mapManager = new MapManager();
});