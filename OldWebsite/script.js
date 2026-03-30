// Sélectionne l'icône de recherche et la barre de recherche
const searchIcon = document.querySelector('.ImageRecherche');
const searchBar = document.querySelector('.BarreRecherche');

// Sélectionne toutes les boîtes Pokémon
const allBoites = document.querySelectorAll('.BoitePoke1, .BoitePoke2');

// Objet de mappage pour les types
const typeMapping = {
    'acier': 'Img/Metal.png',
    'feu': 'Img/Feu.png',
    'electrik': 'Img/Foudre.png',
    'fee': 'Img/Fee.png',
    'phantom': 'Img/Spectre.png',
    // Ajoutez d'autres mappages ici si nécessaire
};

// Ajoute un événement de clic sur l'icône de recherche
searchIcon.addEventListener('click', () => {
    // Alterne l'affichage de la barre de recherche
    if (searchBar.style.display === 'none' || searchBar.style.display === '') {
        searchBar.style.display = 'block'; // Affiche la barre de recherche
        searchBar.focus(); // Focalise la barre de recherche pour que l'utilisateur puisse taper immédiatement
    } else {
        searchBar.style.display = 'none'; // Cache la barre de recherche
    }
});

// Ajoute un événement de clic sur le document entier pour cacher la barre de recherche
document.addEventListener('click', (event) => {
    // Vérifie si le clic s'est produit à l'extérieur de l'icône ou de la barre de recherche
    if (!searchIcon.contains(event.target) && !searchBar.contains(event.target)) {
        searchBar.style.display = 'none'; // Cache la barre de recherche
        searchBar.value = ''; // Efface le texte dans la barre de recherche
        filterBoites(''); // Réaffiche toutes les boîtes
    }
});

// Fonction de filtrage des boîtes Pokémon
function filterBoites(query) {
    query = query.toLowerCase(); // Convertit la requête en minuscules pour la comparaison
    allBoites.forEach(boite => {
        const nom = boite.querySelector('.TextePoke').textContent.toLowerCase();
        const numero = boite.querySelector('.TextePokeN').textContent.toLowerCase();
        // Récupère les types d'images en utilisant src et les convertit en noms de types avec la correspondance
        const types = Array.from(boite.querySelectorAll('.Logo')).map(img => {
            const src = img.src.split('/').pop(); // Extrait le nom du fichier à partir de src
            return typeMapping[src] || src; // Cherche dans le mapping ou utilise le nom du fichier tel quel
        }).join(' ').toLowerCase(); // Convertit les types en une chaîne unique
        // Vérifie si la boîte est cliquée
        const isClicked = boite.classList.contains('clicked');

        // Vérifie si la boîte correspond à la requête de recherche
        const matchesQuery = nom.includes(query) || numero.includes(query) || types.includes(query);

        // Affiche ou cache la boîte en fonction de la correspondance
        if (matchesQuery) {
            boite.style.display = isClicked ? 'flex' : 'inline-block'; // Affiche en flex si cliquée, sinon en inline-block
       } else {
            boite.style.display = 'none'; // Cache la boîte
        }
    });
}

// Ajoute un événement de saisie sur la barre de recherche pour filtrer les boîtes Pokémon
searchBar.addEventListener('input', () => {
    filterBoites(searchBar.value);
});

document.querySelectorAll('.BoitePoke1, .BoitePoke2').forEach(boite => {
    boite.addEventListener('click', function(event) {
        // Empêche la propagation du clic au document
        event.stopPropagation(); 
        
        // Vérifie si la boîte est déjà 'clicked'
        const isClicked = this.classList.contains('clicked');

        // Retire la classe 'clicked' de toutes les boîtes pour fermer les autres
        document.querySelectorAll('.BoitePoke1, .BoitePoke2').forEach(b => b.classList.remove('clicked'));

        // Si la boîte n'était pas déjà cliquée, l'ouvre
        if (!isClicked) {
            this.classList.add('clicked');
        }

        // Appelle filterBoites après un clic
        filterBoites(searchBar.value); // Passe la valeur actuelle de la barre de recherche

    });
});

// Gestion du clic en dehors de la boîte pour fermer la boîte modale
document.addEventListener('click', function() {
    document.querySelectorAll('.BoitePoke1, .BoitePoke2').forEach(boite => boite.classList.remove('clicked'));
});