let allMovies = [];
let originalMovies = [];  // To keep the original order of movies
let currentSortState = '';  // Start with no sort state
let users = [];  // Array to store user profiles
let selectedUser = null;  // Currently selected user

document.addEventListener('DOMContentLoaded', function() {
    fetchMovies();
    addEventListeners();  // Adding event listeners on page load
});

function fetchMovies() {
    fetch('movies.json')
        .then(response => response.json())
        .then(data => {
            allMovies = data.map(movie => ({
                ...movie,
                ratingAudience: parseFloat(movie.ratingAudience),
                ratingCritic: parseFloat(movie.ratingCritic)
            }));
            originalMovies = [...allMovies];  // Save the original order
            populateGenreNav(data);
            populateMovies(allMovies);  // Initially populate movies using allMovies
        })
        .catch(error => console.error('Error loading the movies:', error));
}

function populateGenreNav(movies) {
    const genres = [...new Set(movies.map(movie => movie.Genre))];
    const genreNav = document.getElementById('genreNav');
    genreNav.innerHTML = '';
    const allButton = document.createElement('button');
    allButton.classList.add('btn', 'btn-outline-secondary');
    allButton.textContent = 'All';
    allButton.addEventListener('click', function() {
        populateMovies(allMovies);
        toggleMovieListVisibility(true);
    });
    genreNav.appendChild(allButton);
    genres.forEach(genre => {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-outline-primary');
        button.textContent = genre;
        button.addEventListener('click', function() {
            const filteredMovies = allMovies.filter(movie => movie.Genre === genre);
            populateMovies(filteredMovies);
            toggleMovieListVisibility(true);
            document.getElementById('genreHeading').textContent = genre;
            getSortFunction();
        });
        genreNav.appendChild(button);
    });
}

function populateMovies(movies) {
    const movieList = document.getElementById('movieList');
    const header = document.querySelector('.movie-header').cloneNode(true); // Clone the header

    movieList.innerHTML = '';
    movieList.appendChild(header); // Re-append the header

    // Reattach event listeners to the sorting headers
    addEventListeners();

    movies.forEach(movie => {
        const movieItem = document.createElement('li');
        movieItem.classList.add('list-group-item', 'movie-item');

        const movieTitle = document.createElement('div');
        movieTitle.textContent = movie.Title;

        const movieYear = document.createElement('div');
        movieYear.textContent = movie.Year;

        const movieRatings = document.createElement('div');
        const scoresDisplay = (currentSortState.includes('audience')) ?
            `<span class="rating-primary">${movie.ratingAudience}</span> / <span class="rating-secondary">(${movie.ratingCritic})</span>` :
            `<span class="rating-primary">${movie.ratingCritic}</span> / <span class="rating-secondary">(${movie.ratingAudience})</span>`;
        movieRatings.innerHTML = scoresDisplay;

        const userRating = document.createElement('div');
        if (selectedUser) {
            const userMovieRating = selectedUser.ratings[movie.Title] || '';
            userRating.textContent = userMovieRating;
        } else {
            userRating.textContent = '';
        }

        movieItem.append(movieTitle, movieYear, movieRatings, userRating);
        movieList.appendChild(movieItem);
    });

    updateSortingIndicators();
}



function addEventListeners() {
    document.getElementById('titleSort').addEventListener('click', function() {
        sortList('title');
    });
    document.getElementById('yearSort').addEventListener('click', function() {
        sortList('year');
    });
    document.getElementById('scoreSort').addEventListener('click', function() {
        sortList('score');
    });
    document.getElementById('userRatingSort').addEventListener('click', function() {
        sortList('userRating');
    });
}

function sortList(type) {
    if (type === 'title' || type === 'year') {
        if (currentSortState.startsWith(type) && currentSortState.endsWith('Desc')) {
            currentSortState = '';  // Reset to default order
            allMovies = [...originalMovies];
        } else {
            currentSortState = type + (currentSortState.endsWith('Asc') ? 'Desc' : 'Asc');
            allMovies.sort(getSortFunction(currentSortState));
        }
    } else if (type === 'score') {  // For audience/critic score
        if (currentSortState.startsWith('critic') && currentSortState.endsWith('Desc')) {
            currentSortState = '';  // Reset to default order
            allMovies = [...originalMovies];
        } else {
            currentSortState = currentSortState.includes('audience') ?
                (currentSortState === 'audienceAsc' ? 'audienceDesc' : 'criticAsc') :
                (currentSortState === 'criticAsc' ? 'criticDesc' : 'audienceAsc');
            allMovies.sort(getSortFunction(currentSortState));
        }
    } else if (type === 'userRating') {  // For user rating
        if (currentSortState.startsWith('userRating') && currentSortState.endsWith('Desc')) {
            currentSortState = '';  // Reset to default order
            allMovies = [...originalMovies];
        } else {
            currentSortState = currentSortState === 'userRatingAsc' ? 'userRatingDesc' : 'userRatingAsc';
            allMovies.sort(getSortFunction(currentSortState));
        }
    }
    populateMovies(allMovies);
}

function getSortFunction(sortState) {
    switch (sortState) {
        case 'titleAsc': return (a, b) => a.Title.localeCompare(b.Title);
        case 'titleDesc': return (a, b) => b.Title.localeCompare(a.Title);
        case 'yearAsc': return (a, b) => a.Year - b.Year;
        case 'yearDesc': return (a, b) => b.Year - a.Year;
        case 'audienceAsc': return (a, b) => a.ratingAudience - b.ratingAudience;
        case 'audienceDesc': return (a, b) => b.ratingAudience - a.ratingAudience;
        case 'criticAsc': return (a, b) => a.ratingCritic - b.ratingCritic;
        case 'criticDesc': return (a, b) => b.ratingCritic - a.ratingCritic;
        case 'userRatingAsc': 
        return (a, b) => {
            const ratingA = getUserRating(a);
            const ratingB = getUserRating(b);

            // Prioritize movies with ratings
            if (ratingA === -Infinity && ratingB !== -Infinity) return 1;
            if (ratingA !== -Infinity && ratingB === -Infinity) return -1;

            return ratingA - ratingB;
        };
    case 'userRatingDesc': 
        return (a, b) => {
            const ratingA = getUserRating(a);
            const ratingB = getUserRating(b);

            // Prioritize movies with ratings
            if (ratingA === -Infinity && ratingB !== -Infinity) return 1;
            if (ratingA !== -Infinity && ratingB === -Infinity) return -1;

            return ratingB - ratingA;
        };
    default: 
        return () => 0;  // No sorting
    }
}

function getUserRating(movie) {
    if (selectedUser && selectedUser.ratings[movie.Title]) {
        return parseFloat(selectedUser.ratings[movie.Title]);
    }
    return -Infinity;  // Treat unrated movies as the lowest value for sorting purposes
}

function updateSortingIndicators() {
    document.getElementById('titleSort').textContent = currentSortState.includes('title') ? (currentSortState.endsWith('Asc') ? 'Title ↑' : 'Title ↓') : 'Title';
    document.getElementById('yearSort').textContent = currentSortState.includes('year') ? (currentSortState.endsWith('Asc') ? 'Year ↑' : 'Year ↓') : 'Year';

    if (currentSortState.includes('audience') || currentSortState.includes('critic')) {
        document.getElementById('scoreSort').textContent = currentSortState.includes('audience') ? 
            (currentSortState.endsWith('Asc') ? 'Rating Audience ↑ / (Critic)' : 'Rating Audience ↓ / (Critic)') :
            (currentSortState.endsWith('Asc') ? 'Rating Critic ↑ / (Audience)' : 'Rating Critic ↓ / (Audience)');
    } else {
        document.getElementById('scoreSort').textContent = 'Rating Audience / (Critic)';
    }

    if (currentSortState.startsWith('userRating')) {
        document.getElementById('userRatingSort').textContent = 
            currentSortState.endsWith('Asc') ? 'Your Rating ↑' : 'Your Rating ↓';
    } else {
        document.getElementById('userRatingSort').textContent = 'Your Rating';
    }
}

function toggleMovieListVisibility(show) {
    const movieList = document.getElementById('movieList');
    movieList.style.display = show ? 'block' : 'none';
}
