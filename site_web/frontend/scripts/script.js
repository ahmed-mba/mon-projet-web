// Données de démonstration pour les destinations
const destinations = [
    { 
        name: 'Paris', 
        country: 'France', 
        category: 'City Break', 
        budget: 'modere', 
        duration: 'weekend' 
    },
    { 
        name: 'Tokyo', 
        country: 'Japon', 
        category: 'Culture', 
        budget: 'luxe', 
        duration: 'semaine' 
    },
    { 
        name: 'New York', 
        country: 'États-Unis', 
        category: 'City Break', 
        budget: 'luxe', 
        duration: 'quinzaine' 
    },
    { 
        name: 'Bali', 
        country: 'Indonésie', 
        category: 'Détente', 
        budget: 'economique', 
        duration: 'semaine' 
    },
    { 
        name: 'Rome', 
        country: 'Italie', 
        category: 'Culture', 
        budget: 'modere', 
        duration: 'weekend' 
    },
    { 
        name: 'Sydney', 
        country: 'Australie', 
        category: 'Aventure', 
        budget: 'luxe', 
        duration: 'quinzaine' 
    }
];

// Sélection des éléments
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navbar = document.querySelector('.navbar');
const searchInput = document.getElementById('searchInput');
const autocompleteContainer = document.getElementById('autocomplete');
const searchButton = document.querySelector('.search-button');
const destinationsGrid = document.querySelector('.destinations-grid');
const budgetFilter = document.querySelector('.filter-select:nth-child(1)');
const durationFilter = document.querySelector('.filter-select:nth-child(2)');
const typeFilter = document.querySelector('.filter-select:nth-child(3)');

// Toggle menu mobile
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
});

// Fermer le menu quand on clique sur un lien
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

// Animation de la navbar au scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Gestion de l'autocomplétion
searchInput.addEventListener('input', (e) => {
    const value = e.target.value.toLowerCase();
    autocompleteContainer.innerHTML = ''; // Vide les suggestions précédentes
    
    if (value.length < 2) {
        autocompleteContainer.style.display = 'none';
        return;
    }

    // Filtrer les destinations qui correspondent
    const suggestions = destinations.filter(dest => 
        dest.name.toLowerCase().includes(value) || 
        dest.country.toLowerCase().includes(value)
    );

    if (suggestions.length > 0) {
        autocompleteContainer.style.display = 'block';
        suggestions.forEach(dest => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = `${dest.name}, ${dest.country}`;
            div.addEventListener('click', () => {
                searchInput.value = `${dest.name}, ${dest.country}`;
                autocompleteContainer.style.display = 'none';
            });
            autocompleteContainer.appendChild(div);
        });
    } else {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = 'Aucune destination trouvée';
        autocompleteContainer.appendChild(div);
        autocompleteContainer.style.display = 'block';
    }
});

// Fermer l'autocomplétion en cliquant ailleurs
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !autocompleteContainer.contains(e.target)) {
        autocompleteContainer.style.display = 'none';
    }
});

// Fonction de recherche
function handleSearch(event) {
    event.preventDefault();
    
    const searchTerm = searchInput.value.toLowerCase();
    const budgetValue = budgetFilter.value;
    const durationValue = durationFilter.value;
    const typeValue = typeFilter.value;

    const filteredDestinations = destinations.filter(destination => {
        const matchesSearch = 
            destination.name.toLowerCase().includes(searchTerm) || 
            destination.country.toLowerCase().includes(searchTerm);
        
        const matchesBudget = !budgetValue || destination.budget === budgetValue;
        const matchesDuration = !durationValue || destination.duration === durationValue;
        const matchesType = !typeValue || destination.category.toLowerCase() === typeValue;

        return matchesSearch && matchesBudget && matchesDuration && matchesType;
    });

    displayDestinations(filteredDestinations);
}

// Fonction pour afficher les destinations
function displayDestinations(destinations) {
    destinationsGrid.innerHTML = ''; // Vider la grille existante

    if (destinations.length === 0) {
        destinationsGrid.innerHTML = '<p>Aucune destination trouvée.</p>';
        return;
    }

    destinations.forEach(destination => {
        const card = document.createElement('div');
        card.className = 'destination-card';
        card.innerHTML = `
            <div class="destination-image" style="background-color: #f0f0f0;"></div>
            <div class="destination-info">
                <h3>${destination.name}, ${destination.country}</h3>
                <p>Catégorie : ${destination.category}</p>
                <p>Budget : ${destination.budget}</p>
                <p>Durée : ${destination.duration}</p>
            </div>
        `;
        destinationsGrid.appendChild(card);
    });
}

// Écouteurs d'événements pour la recherche
searchButton.addEventListener('click', handleSearch);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        handleSearch(e);
    }
});

// Animation des cartes de destination
document.querySelectorAll('.destination-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Initialisation : afficher toutes les destinations
document.addEventListener('DOMContentLoaded', () => {
    displayDestinations(destinations);
});