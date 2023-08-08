import { Router } from 'express';
import { CreateMovieRequest, SearchRequest, getMovieFromImdbRequest } from './movies.interfaces';
import * as movieService from './movies.service';
import * as imdbService from './imdb.service';

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
        const result = await imdbService.searchImdb(searchTerm);
        res.status(200).send(result);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.get('/imdb/:imdbId', async ({ params: { imdbId } }: getMovieFromImdbRequest, res) => {
    try {
        const result = await imdbService.getMovieFromImdb(imdbId);
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
