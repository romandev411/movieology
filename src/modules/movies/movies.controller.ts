import { Router } from 'express';
import { SearchRequest } from './movies.interfaces';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = Router();

const BASE_SEARCH_URL = 'https://torrentz2.nz/search?q=';
router.get('/search', async ({ query: { searchTerm } }: SearchRequest, res) => {
    try {
        const searchResult = await axios.get(`${BASE_SEARCH_URL}${searchTerm}`);
        const $ = cheerio.load(searchResult.data);
        // const data = $('.results td:last-child a').toArray();
        const pagination = $('.pagination a')
            .toArray()
            .map(el => {
                return Number($(el).text());
            });
        const countPages = Math.max(...pagination);
        let linkInPages = [];

        for (let i = 1; i <= countPages; i++) {
            const nextPage = await axios.get(`${BASE_SEARCH_URL}${searchTerm}&page=${i}`);
            const $ = cheerio.load(nextPage.data);
            const results = $('.results dl')
                .toArray()
                .map(m => {
                    const titleTag = $(m).find('dt').find('a');
                    const magnetTag = $(m).find('dd').find('a');
                    const magnet = $(magnetTag).attr('href').split('&')[0].replace('magnet:?xt=urn:btih:', '');
                    const title = $(titleTag).text();
                    const link = $(titleTag).attr('href');

                    return { magnet, title, link };
                });
            linkInPages.push(results);

            if (i > 100) {
                break;
            }
        }

        const results = linkInPages.flat(Infinity);
        res.status(200).send(results);
    } catch (err) {
        res.status(400).send(err);
    }
});

export default router;
