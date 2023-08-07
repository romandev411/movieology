import axios from 'axios';
import * as cheerio from 'cheerio';
import { BASE_SEARCH_URL, MAGNET_KEY } from './movies.const';

export const movieSearch = async (searchTerm: string) => {
    const searchResult = await axios.get(`${BASE_SEARCH_URL}${searchTerm}`);
    const $ = cheerio.load(searchResult.data);
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
                const magnet = $(magnetTag).attr('href').split('&')[0].replace(MAGNET_KEY, '');
                const title = $(titleTag).text();
                const link = $(titleTag).attr('href');
                const hrefTitle = $(titleTag).attr('href').split('/');

                return { magnet, title, link, hrefTitle: hrefTitle[hrefTitle.length - 1] };
            });
        linkInPages.push(results);

        if (i > 100) {
            break;
        }
    }

    return linkInPages.flat(Infinity);
};
