import { Router } from 'express';
import { SearchRequest } from './movies.interfaces';
import { movieSearch } from './movies.service';

const router = Router();

router.get('/search', async ({ query: { searchTerm } }: SearchRequest, res) => {
    try {
        const data = await movieSearch(searchTerm);
        res.status(200).send(data);
    } catch (err) {
        res.status(400).send(err);
    }
});

export default router;
