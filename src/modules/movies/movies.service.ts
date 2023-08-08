import axios from 'axios';
import * as cheerio from 'cheerio';
import { BASE_SEARCH_URL, MAGNET_KEY, IMDB_SEARCH_URL } from './movies.const';
import { Movie } from './movies.interfaces';
import MovieEntity from './movies.model';
import { stringify } from 'qs';

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
                const fileName = $(titleTag).text();
                const link = $(titleTag).attr('href');
                const hrefTitle = $(titleTag).attr('href').split('/');

                return { magnet, fileName, link, hrefTitle: hrefTitle[hrefTitle.length - 1] };
            });
        linkInPages.push(results);

        if (i > 100) {
            break;
        }
    }

    return linkInPages.flat(Infinity);
};

export const searchImdb = async query => {
    const qp = stringify({
        language: 'en',
        api_key: '83880cd2c8804830f4b1b877c25b3e6f',
        query,
    });
    const {
        data: { results },
    } = await axios.get(`${IMDB_SEARCH_URL}/search/movie?${qp}`);
    const [movie] = results;
    return movie;
};

export const create = async (input: Movie) => {
    const item = new MovieEntity(input);
    await item.save();
    return item;
};

export const update = (input: Partial<Movie>, id: string) => {
    return MovieEntity.findByIdAndUpdate(id, input, {
        new: true,
    });
};

export const findOne = (id: string) => {
    return MovieEntity.findById(id);
};

export const findAll = () => {
    return MovieEntity.find();
};

export const deleteOne = (id: string) => {
    return MovieEntity.findByIdAndRemove(id);
};
