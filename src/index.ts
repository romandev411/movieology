import express from 'express';
import cors from 'cors';
import logger from 'morgan';
import * as path from 'path';
import mongoose from 'mongoose';
import 'dotenv/config';

// routes
import streamRouter from './modules/stream/stream.controller';
import contentRouter from './modules/content/content.controller';
import moviesRouter from './modules/movies/movies.controller';

try {
    mongoose.connect(process.env.MONGO_URL).then(() => {
        console.log('DB conected');
    });
} catch (err) {
    console.log('Conect in mongo failed', err);
}

// middleware
const app = express();
app.use(cors());
app.use(express.json());
app.use(logger('dev'));

app.use('/stream', streamRouter);
app.use('/content', contentRouter);
app.use('/movies', moviesRouter);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log('Начало работ');
    console.log('PORT:' + ' ' + PORT);
});
