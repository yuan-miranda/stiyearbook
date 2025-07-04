async function fetchImages() {
    try {
        const response = await fetch('/api/images');
        const data = await response.json();
        return data.images || [];
    } catch (error) {
        console.error(error);

        // fallback for local development
        return ['images/514339117_1144316810835962_6147571552177112786_n.jpg'];
    }
}

async function generateGrid() {
    const count = parseInt(document.getElementById('gridCount').value) || 6;
    const container = document.getElementById('gridContainer');
    const imageSources = await fetchImages();

    container.innerHTML = '';

    for (let i = 1; i <= count; i++) {
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        gridItem.setAttribute('data-index', i);

        // check if image source exists for this index
        if (imageSources[i - 1]) {
            const img = document.createElement('img');
            img.src = imageSources[i - 1];
            img.alt = `Photo ${i}`;

            img.onload = () => gridItem.classList.add('has-image');
            img.onerror = () => {
                img.remove();
                gridItem.innerHTML = `<div class="placeholder">Photo ${i}</div>`;
            };

            gridItem.appendChild(img);

        } else {
            // if no image source, show placeholder
            gridItem.innerHTML = `<div class="placeholder">Photo ${i}</div>`;
        }

        gridItem.onclick = () => { };
        container.appendChild(gridItem);
    }
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

document.addEventListener('DOMContentLoaded', () => {
    const gridInput = document.getElementById('gridCount');
    gridInput.min = '1';
    gridInput.value = '8';

    keyboardShortcuts();
    generateGrid();
});