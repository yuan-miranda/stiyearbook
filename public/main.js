async function fetchImages(folder = 'stoles') {
    try {
        const response = await fetch('/images/image-index.json');
        const data = await response.json();
        return data[folder] || [];
    } catch (error) {
        console.error(error);

        // fallback for local development
        return Array(16).fill('').map((_, i) => '');
    }
}

// Intersection Observer for lazy loading
let imageObserver;

function initializeImageObserver() {
    if (imageObserver) {
        imageObserver.disconnect();
    }

    imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const gridItem = entry.target;
                const imageSrc = gridItem.getAttribute('data-src');
                const index = gridItem.getAttribute('data-index');

                if (imageSrc) {
                    loadImage(gridItem, imageSrc, index);
                }
                
                imageObserver.unobserve(gridItem);
            }
        });
    }, {
        rootMargin: '50px' // Start loading when item is 50px away from viewport
    });
}

function loadImage(gridItem, src, index) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Photo ${index}`;

    img.onload = () => {
        gridItem.classList.add('has-image');
        gridItem.innerHTML = '';
        gridItem.appendChild(img);
    };

    img.onerror = () => {
        gridItem.innerHTML = `<div class="placeholder">Photo ${index}</div>`;
    };
}

async function generateGrid() {
    const inputValue = parseInt(document.getElementById('gridCount').value) || 8;
    const container = document.getElementById('gridContainer');

    const activeFolder = document.getElementById('stolesBtn').classList.contains('active') ? 'stoles' : 'toga';
    const imageSources = await fetchImages(activeFolder);

    // cap to the maximum available images
    const count = Math.min(inputValue, imageSources.length);

    container.innerHTML = '';
    initializeImageObserver();

    for (let i = 1; i <= count; i++) {
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        gridItem.setAttribute('data-index', i);

        // check if image source exists for this index
        if (imageSources[i - 1]) {
            // Store the image source but don't load it yet
            gridItem.setAttribute('data-src', imageSources[i - 1]);
            gridItem.innerHTML = `<div class="placeholder">Photo ${i}</div>`;
            
            // Observe this element for lazy loading
            imageObserver.observe(gridItem);
        } else {
            // if no image source, show placeholder
            gridItem.innerHTML = `<div class="placeholder">Photo ${i}</div>`;
        }

        gridItem.onclick = () => { };
        container.appendChild(gridItem);
    }
}

function toggleButton(folder) {
    const stolesBtn = document.getElementById('stolesBtn');
    const togaBtn = document.getElementById('togaBtn');

    if (folder === 'stoles') {
        stolesBtn.classList.add('active');
        togaBtn.classList.remove('active');
    } else if (folder === 'toga') {
        togaBtn.classList.add('active');
        stolesBtn.classList.remove('active');
    }

    generateGrid();
}

function keyboardShortcuts() {
    const gridInput = document.getElementById('gridCount');

    document.addEventListener('keydown', (e) => {
        // 'Ctrl+K' to focus input
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            gridInput.focus();
            gridInput.select();
        }

        // 'Enter' to generate grid
        if (e.key === 'Enter' && document.activeElement === gridInput) {
            e.preventDefault();
            generateGrid();
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const gridInput = document.getElementById('gridCount');
    gridInput.min = '1';

    // initial fetch of images from stoles folder (default active)
    const imageSources = await fetchImages('stoles');
    const maxImages = imageSources.length;

    gridInput.max = maxImages;
    gridInput.value = maxImages;

    // prevent input from exceeding maxImages and non-numerical input
    gridInput.addEventListener('input', () => {
        // Remove any non-digit characters
        gridInput.value = gridInput.value.replace(/[^0-9]/g, '');

        const value = parseInt(gridInput.value);
        if (value > maxImages) gridInput.value = maxImages;
        if (value < 1 && gridInput.value !== '') gridInput.value = 1;
    });

    keyboardShortcuts();
    generateGrid();
});