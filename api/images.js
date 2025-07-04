import { readdir } from 'fs/promises';
import { join } from 'path';

export default async function handler(req, res) {
    try {
        const imagesDir = join(process.cwd(), 'public', 'images');
        const files = await readdir(imagesDir);

        // add the path prefix to all files
        const images = files.map(file => `images/${file}`);

        res.json({ images });

    } catch (error) {
        res.status(500).json({ images: [] });
    }
}
