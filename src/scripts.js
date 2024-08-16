let debounceTimeout = null;

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const userIndex = urlParams.get('user');
    const currentPage = window.location.pathname.split('/').pop();

    // Load the state of the menu from localStorage
    const menuOpen = localStorage.getItem('menuOpen') === 'true';

    if (menuOpen) {
        document.getElementById("mySidenav").classList.add('open');
        document.body.classList.add('menu-open');
    }

    if (userIndex) {
        loadUser(userIndex);
        updateLinks(userIndex);
    }

    // Highlight the current page in the menu
    highlightCurrentPage(currentPage);

    // Add event listeners for the menu links to handle page transitions
    document.querySelectorAll('.side-nav a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            if (debounceTimeout) return; // Prevents the click if another is in progress

            const targetUrl = this.href;
            const mainContent = document.querySelector('.main-content');

            if (mainContent) {  // Check if the element exists
                mainContent.classList.add('fade-out');
            }

            debounceTimeout = setTimeout(() => {
                window.location.href = targetUrl;
            }, 400); // Match the delay to the CSS transition duration

            // Disable the links to prevent further clicks
            disableLinks();
        });
    });
});


function disableLinks() {
    document.querySelectorAll('.side-nav a').forEach(link => {
        link.style.pointerEvents = 'none';
    });
}

function enableLinks() {
    document.querySelectorAll('.side-nav a').forEach(link => {
        link.style.pointerEvents = 'auto';
    });
}

function openNav() {
    document.getElementById("mySidenav").classList.add('open');
    document.body.classList.add('menu-open');
    localStorage.setItem('menuOpen', 'true');
}

function closeNav() {
    document.getElementById("mySidenav").classList.remove('open');
    document.body.classList.remove('menu-open');
    localStorage.setItem('menuOpen', 'false');
}

function loadUser(index) {
    fetch('users.json')
        .then(response => response.json())
        .then(users => {
            selectedUser = users[index];
            document.getElementById('userGreeting').textContent = `Hi, ${selectedUser.name}`;
        })
        .catch(error => console.error('Error loading user data:', error));
}

function updateLinks(userIndex) {
    const links = document.querySelectorAll('#mySidenav a');

    links.forEach(link => {
        // Parse the existing URL
        const url = new URL(link.href);

        // Remove any existing 'user' search parameters
        url.searchParams.delete('user');

        // Append the new 'user' parameter
        url.searchParams.append('user', userIndex);

        // Update the href attribute
        link.href = url.toString();
    });
}


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
