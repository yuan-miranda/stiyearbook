import { readdir } from 'fs/promises';
import { join } from 'path';

export default async function handler(req, res) {
    try {
        const { folder = 'stoles' } = req.query;
        const imagesDir = join(process.cwd(), 'public', 'media', folder);
        const files = await readdir(imagesDir);

        // add the path prefix to all files
        const images = files.map(file => `media/${folder}/${file}`);

        res.json({ images });

    } catch (error) {
        console.error(error);
        res.status(500).json({ images: [] });
    }
}
