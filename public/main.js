let observer;

async function fetchImages(folder = 'stoles') {
    try {
        const response = await fetch(`/api/images?folder=${folder}`);
        const data = await response.json();
        return data.images || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function generateGrid(folder = 'stoles') {
    const gridContainer = document.querySelector('.grid-container');
    const imageSources = await fetchImages(folder);
    gridContainer.innerHTML = '';

    // create all blank grid items
    imageSources.forEach(src => {
        const gridItem = document.createElement('div');
        gridItem.classList.add('grid-item');
        gridItem.setAttribute('data-src', src);
        gridItem.classList.add('placeholder');
        gridContainer.appendChild(gridItem);
    });

    if (observer) observer.disconnect();
    initImageObserver();
    document.querySelectorAll('.grid-item').forEach(item => observer.observe(item));
}

function initImageObserver() {
    const options = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    };

    const loadDelay = 300;
    const timers = new WeakMap();

    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const gridItem = entry.target;
            if (entry.isIntersecting) {
                // hard-coded delay to prevent all images from loading all at once
                const timer = setTimeout(() => {
                    const imageSrc = gridItem.getAttribute('data-src');
                    if (imageSrc) {
                        loadImage(gridItem, imageSrc);
                        observer.unobserve(gridItem);
                        timers.delete(gridItem);
                    }
                }, loadDelay);
                timers.set(gridItem, timer);
            } else {
                if (timers.has(gridItem)) {
                    clearTimeout(timers.get(gridItem));
                    timers.delete(gridItem);
                }
            }
        });
    }, options);
}

function loadImage(gridItem, imageSrc) {
    const img = document.createElement('img');
    img.src = imageSrc;
    img.onload = () => {
        gridItem.style.height = 'img.naturalHeight + "px"';
        gridItem.appendChild(img);
        gridItem.classList.remove('placeholder');
    };
}

function eventListeners() {
    const stolesBtn = document.getElementById('stolesBtn');
    const togaBtn = document.getElementById('togaBtn');

    stolesBtn.addEventListener('click', () => {
        generateGrid('stoles');

        stolesBtn.classList.add('active');
        togaBtn.classList.remove('active');
    });
    togaBtn.addEventListener('click', () => {
        console.log('Toga button clicked');
        generateGrid('toga');

        togaBtn.classList.add('active');
        stolesBtn.classList.remove('active');
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    eventListeners();
    generateGrid();
});
