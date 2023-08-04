import { Request } from 'express';

export interface AddMagnet extends Request {
    params: {
        magneteUrl: string;
    };
}
