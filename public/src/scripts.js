// Declare debounceTimeout in the global scope
let debounceTimeout = null;

// Function to log out the user
function logout() {
    localStorage.removeItem('menuOpen');
    window.location.href = 'index.html';
}

// Function to toggle the side navigation open or closed
function toggleNav() {
    const sideNav = document.getElementById("mySidenav");
    const isOpen = sideNav.classList.contains('open');

    if (isOpen) {
        sideNav.classList.remove('open');
        document.body.classList.remove('menu-open');
        localStorage.setItem('menuOpen', 'false');
    } else {
        sideNav.classList.add('open');
        document.body.classList.add('menu-open');
        localStorage.setItem('menuOpen', 'true');
    }
}

// Function to load the user data based on the user index
function loadUser(index) {
    fetch('users.json')
        .then(response => response.json())
        .then(users => {
            const selectedUser = users[index];
            const userGreeting = document.getElementById('userGreeting');
            userGreeting.textContent = `Hi, ${selectedUser.name}`;
        })
        .catch(error => console.error('Error loading user data:', error));
}

// Function to load and display the user's watch history
function loadWatchHistory(userIndex) {
    fetch('users.json')
        .then(response => response.json())
        .then(users => {
            const selectedUser = users[userIndex];
            const watchHistoryContainer = document.getElementById('watchHistoryContainer');

            // Load movies data
            fetch('movies.json')
                .then(response => response.json())
                .then(movies => {
                    const watchHistory = selectedUser.ratings;
                    const moviesByGenre = {};

                    // Group movies by genre
                    for (const [title, rating] of Object.entries(watchHistory)) {
                        const movieDetails = movies.find(movie => movie.Title === title);
                        if (movieDetails) {
                            const genre = movieDetails.Genre || 'Unknown';
                            if (!moviesByGenre[genre]) {
                                moviesByGenre[genre] = [];
                            }
                            moviesByGenre[genre].push({
                                title: movieDetails.Title,
                                genre: genre,
                                rating: rating,
                                details: movieDetails
                            });
                        }
                    }

                    // Sort movies within each genre by user rating
                    for (const genre in moviesByGenre) {
                        moviesByGenre[genre].sort((a, b) => b.rating - a.rating);
                    }

                    // Display the movies, grouped by genre
                    for (const genre in moviesByGenre) {
                        const genreHeader = document.createElement('h2');
                        genreHeader.className = 'genre-heading';
                        genreHeader.textContent = genre;
                        watchHistoryContainer.appendChild(genreHeader);

                        moviesByGenre[genre].forEach(movie => {
                            const movieItem = document.createElement('div');
                            movieItem.className = 'movie-item';

                            movieItem.innerHTML = `
                                <div class="movie-details">${movie.title}</div>
                                <div class="user-rating">${movie.rating}</div>
                            `;

                            watchHistoryContainer.appendChild(movieItem);
                        });
                    }
                })
                .catch(error => console.error('Error loading movies data:', error));
        })
        .catch(error => console.error('Error loading user data:', error));
}

// Function to update the links in the side nav with the correct user parameter
function updateLinks(userIndex) {
    const links = document.querySelectorAll('#mySidenav a');

    links.forEach(link => {
        if (link.href && !link.href.includes('javascript:void(0)')) {
            try {
                const url = new URL(link.href, window.location.origin);

                url.searchParams.delete('user');
                url.searchParams.append('user', userIndex);

                link.href = url.toString();
            } catch (error) {
                console.error("Invalid URL detected in updateLinks:", link.href, error);
            }
        }
    });
}

// Function to highlight the current page link
function highlightCurrentPage(currentPage) {
    const links = document.querySelectorAll('#mySidenav a');
    links.forEach(link => {
        if (link.href.includes(currentPage)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Function to disable all links in the side nav
function disableLinks() {
    document.querySelectorAll('.side-nav a').forEach(link => {
        link.style.pointerEvents = 'none';
    });
}

// Function to enable all links in the side nav
function enableLinks() {
    document.querySelectorAll('.side-nav a').forEach(link => {
        link.style.pointerEvents = 'auto';
    });
}

// Function to load and display movie recommendations
function loadMovieRecommendations() {
    const movieRecommendations = [
        {
            title: "Inception",
            synopsis: "A thief who steals corporate secrets through the use of dream-sharing technology...",
            genre: "Sci-Fi, Thriller",
            rating: "8.8/10"
        },
        {
            title: "The Shawshank Redemption",
            synopsis: "Two imprisoned men bond over a number of years, finding solace and eventual...",
            genre: "Drama",
            rating: "9.3/10"
        },
        {
            title: "The Dark Knight",
            synopsis: "When the menace known as the Joker emerges from his mysterious past...",
            genre: "Action, Crime, Drama",
            rating: "9.0/10"
        }
    ];

    const carouselInner = document.querySelector('.carousel-inner');

    movieRecommendations.forEach((movie, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.className = `carousel-item${index === 0 ? ' active' : ''}`;

        carouselItem.innerHTML = `
            <div>
                <h5>${movie.title}</h5>
                <p>${movie.synopsis}</p>
                <div class="genre">Genre: ${movie.genre}</div>
                <div class="rating">Rating: ${movie.rating}</div>
            </div>
        `;

        carouselInner.appendChild(carouselItem);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const pageOverlay = document.getElementById('pageOverlay');
    const urlParams = new URLSearchParams(window.location.search);
    const userIndex = urlParams.get('user');
    const currentPage = window.location.pathname.split('/').pop();
    const sideNav = document.getElementById("mySidenav");
    const burgerMenu = document.querySelector('.burger-menu');

    // Ensure the overlay is visible initially
    pageOverlay.classList.remove('hidden');
    pageOverlay.classList.add('visible');

    // Set the side navigation to open by default on specific pages
    const shouldMenuBeOpen = localStorage.getItem('menuOpen') === 'true';
    if (shouldMenuBeOpen) {
        sideNav.classList.add('open', 'no-transition');
        document.body.classList.add('menu-open', 'no-transition');
    }

    // Remove the no-transition class to allow animations after the initial load
    setTimeout(() => {
        sideNav.classList.remove('no-transition');
        document.body.classList.remove('no-transition');
    }, 10);

    // Fade out the overlay after the page has loaded
    setTimeout(() => {
        pageOverlay.classList.add('hidden'); // Fade out the overlay
    }, 500); // Delay to sync with other page load effects

    // Add event listeners to the side nav links for page transition
    document.querySelectorAll('.side-nav a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            if (debounceTimeout) return;

            const targetUrl = this.href;
            const activeLink = document.querySelector('.side-nav a.active');
            const mainContent = document.querySelector('.main-content');

            if (activeLink) {
                activeLink.classList.add('fade-out-highlight'); // Fade out the current highlight
            }

            if (mainContent) {
                mainContent.classList.add('fade-out');
            }

            // Show the overlay before navigating to the new page
            pageOverlay.classList.remove('hidden'); // Fade in the overlay

            setTimeout(() => {
                if (activeLink) {
                    activeLink.classList.remove('active'); // Remove the active class after fade out
                }
                window.location.href = targetUrl;
            }, 400); // Adjust this delay to match the animation duration

            debounceTimeout = setTimeout(() => {
                debounceTimeout = null;
            }, 400);

            disableLinks();
        });
    });

    // Attach the toggle functionality to the burger menu button
    burgerMenu.addEventListener('click', toggleNav);

    // Call the highlightCurrentPage function to highlight the current page link
    highlightCurrentPage(currentPage);

    // Load the user if the userIndex is present
    if (userIndex !== null) {
        loadUser(userIndex);
        updateLinks(userIndex);

        // Load and display the watch history
        loadWatchHistory(userIndex);
    }

    // Load and display the movie recommendations
    if (currentPage === 'recommendations.html') {
        loadMovieRecommendations();
    }
});
