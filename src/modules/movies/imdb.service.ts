import { stringify } from 'qs';
import axios from 'axios';
import { IMDB_SEARCH_URL } from './movies.const';

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

export const getMovieFromImdb = async (imdbId: string) => {
    const qp = stringify({
        language: 'en',
        api_key: '83880cd2c8804830f4b1b877c25b3e6f',
    });

    const result = await axios.get(`${IMDB_SEARCH_URL}/movie/${imdbId}?${qp}`);

    return result.data;
};
