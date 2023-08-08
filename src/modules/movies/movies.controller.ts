import { Router } from 'express';
import { CreateMovieRequest, SearchRequest } from './movies.interfaces';
import * as movieService from './movies.service';

const router = Router();

router.get('/search', async ({ query: { searchTerm } }: SearchRequest, res) => {
    try {
        const data = await movieService.movieSearch(searchTerm);
        res.status(200).send(data);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.get('/imdb-search', async ({ query: { searchTerm } }: SearchRequest, res) => {
    try {
        const result = await movieService.searchImdb(searchTerm);
        res.status(200).send(result);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post('/', async ({ body }: CreateMovieRequest, res) => {
    try {
        const result = await movieService.create(body);
        res.status(200).send(result);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.get('/', async (_, res) => {
    try {
        const result = await movieService.findAll();
        res.status(200).send(result);
    } catch (err) {
        res.status(400).send(err);
    }
});

export default router;
