// Configuration de l'API
const API_URL = 'http://localhost:8000/api';

// Fonction de mise à jour de l'interface d'authentification
function updateAuthUI() {
    const authLink = document.getElementById('authLink');
    const token = localStorage.getItem('token');

    if (authLink) {
        if (token) {
            authLink.textContent = 'Déconnexion';
            authLink.href = '#';
            authLink.onclick = function(e) {
                e.preventDefault();
                localStorage.removeItem('token');
                window.location.href = 'index.html';
            };
        } else {
            authLink.textContent = 'Connexion';
            authLink.href = 'auth.html';
            authLink.onclick = null;
        }
    }
}

// Initialisation des éléments du DOM
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    // Fonction pour basculer entre les formulaires
    function switchForm(formType) {
        tabButtons.forEach(button => {
            if (button.dataset.form === formType) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        if (formType === 'login') {
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        } else {
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        }
    }

    // Écouteurs d'événements pour les onglets
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchForm(button.dataset.form);
        });
    });

    // Gestion du mot de passe visible/caché
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.parentElement.querySelector('input');
            if (input.type === 'password') {
                input.type = 'text';
                button.textContent = '👁️‍🗨️';
            } else {
                input.type = 'password';
                button.textContent = '👁️';
            }
        });
    });

    // Fonctions de validation
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePassword(password) {
        return password.length >= 6;
    }

    function validateName(name) {
        return name.length >= 2;
    }

    // Gestion des erreurs
    function showError(input, message) {
        let parentElement = input.parentElement;
        if (parentElement.classList.contains('password-input')) {
            parentElement = parentElement.parentElement;
        }
        
        const errorElement = parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            input.style.borderColor = '#e74c3c';
        }
    }

    function hideError(input) {
        let parentElement = input.parentElement;
        if (parentElement.classList.contains('password-input')) {
            parentElement = parentElement.parentElement;
        }
        
        const errorElement = parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
            input.style.borderColor = '';
        }
    }

    // Gestion de la connexion
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('#loginEmail');
            const password = loginForm.querySelector('#loginPassword');
            let isValid = true;

            if (!validateEmail(email.value)) {
                showError(email, 'Email invalide');
                isValid = false;
            } else {
                hideError(email);
            }

            if (!validatePassword(password.value)) {
                showError(password, 'Mot de passe trop court');
                isValid = false;
            } else {
                hideError(password);
            }

            if (isValid) {
                try {
                    const formData = new URLSearchParams();
                    formData.append('username', email.value);
                    formData.append('password', password.value);

                    const response = await fetch(`${API_URL}/auth/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: formData
                    });

                    const data = await response.json();

                    if (response.ok) {
                        localStorage.setItem('token', data.access_token);
                        updateAuthUI(); // Mettre à jour l'interface
                        alert('Connexion réussie !');
                        window.location.href = 'index.html';
                    } else {
                        showError(email, 'Identifiants incorrects');
                    }
                } catch (error) {
                    console.error('Erreur de connexion:', error);
                    showError(email, 'Erreur de connexion au serveur');
                }
            }
        });
    }

    // Gestion de l'inscription
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = registerForm.querySelector('#registerName');
            const email = registerForm.querySelector('#registerEmail');
            const password = registerForm.querySelector('#registerPassword');
            let isValid = true;

            if (!validateName(name.value)) {
                showError(name, 'Nom trop court');
                isValid = false;
            } else {
                hideError(name);
            }

            if (!validateEmail(email.value)) {
                showError(email, 'Email invalide');
                isValid = false;
            } else {
                hideError(email);
            }

            if (!validatePassword(password.value)) {
                showError(password, 'Mot de passe trop court');
                isValid = false;
            } else {
                hideError(password);
            }

            if (isValid) {
                try {
                    const response = await fetch(`${API_URL}/auth/register`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: name.value,
                            email: email.value,
                            password: password.value
                        })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        alert('Inscription réussie !');
                        switchForm('login');
                    } else {
                        showError(email, data.detail || 'Erreur lors de l\'inscription');
                    }
                } catch (error) {
                    console.error('Erreur d\'inscription:', error);
                    showError(email, 'Erreur de connexion au serveur');
                }
            }
        });
    }

    // Mettre à jour l'interface au chargement
    updateAuthUI();

    // Rediriger si déjà connecté
    const token = localStorage.getItem('token');
    if (token && window.location.pathname.includes('auth.html')) {
        window.location.href = 'index.html';
    }
});