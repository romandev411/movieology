import { Router, Response, Request, NextFunction } from 'express';
import WebTorrent, { Torrent, TorrentFile } from 'webtorrent';

const router = Router();
const client = new WebTorrent();

let state = {
    progress: 0,
    downloadSpeed: 0,
    ratio: 0,
};

let error;

client.on('error', (err: Error) => {
    console.error('err', err.message);
    error = err.message;
});

client.on('torrent', () => {
    state = {
        progress: Math.round(client.progress * 100 * 100) / 100,
        downloadSpeed: client.downloadSpeed,
        ratio: client.ratio,
    };
});

router.get('/add/:magnet', (req: Request, res: Response) => {
    const magnet = req.params.magnet;

    client.add(magnet, torrent => {
        const files = torrent.files.map(data => ({
            name: data.name,
            length: data.length,
        }));

        res.status(200).send(files);
    });
});

router.get('/stats', (req: Request, res: Response) => {
    state = {
        progress: Math.round(client.progress * 100 * 100) / 100,
        downloadSpeed: client.downloadSpeed,
        ratio: client.ratio,
    };

    res.status(200).send(state);
});

// stream

interface StreamRequest extends Request {
    params: {
        magnet: string;
        fileName: string;
    };
    headers: {
        range: string;
    };
}

interface ErrorWithStatus extends Error {
    status: number;
}

router.get('/:magnet/:fileName', (req: StreamRequest, res: Response, next: NextFunction) => {
    console.log(req.range);
    const {
        params: { magnet, fileName },
        headers: { range },
    } = req;

    if (!range) {
        const error = new Error('Range is not defined') as ErrorWithStatus;
        error.status = 416;
        return next(error);
    }
    const torrentFile = client.get(magnet) as Torrent;

    let file = <TorrentFile>{};

    for (let i = 0; i < torrentFile.files.length; i++) {
        const currentTottentPiece = torrentFile.files[i];

        if (currentTottentPiece.name === fileName) {
            file = currentTottentPiece;
        }
    }

    const fileSize = file.length;
    const [startParsed, endParsed] = range.replace(/bytes=/, '').split('-');

    const start = Number(startParsed);
    const end = endParsed ? Number(endParsed) : fileSize - 1;

    const chankSize = end - start + 1;

    console.log('fileSize', fileSize);
    console.log('start', start);
    console.log('endParsed', endParsed);
    console.log('chankSize', chankSize);

    const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chankSize,
        'Content-Type': 'video/mp4',
    };

    res.writeHead(206, headers);

    const streamPositions = {
        start,
        end,
    };

    const steam = file.createReadStream(streamPositions);
    steam.pipe(res);
    steam.on('error', err => {
        return next(err);
    });
});

export default router;
