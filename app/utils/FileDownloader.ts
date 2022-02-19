import fs from 'fs';
import fetch from 'node-fetch';
import log from 'electron-log';

export class FileDownloader {
    constructor(private fsLocation: string, private url: string) { }
    public async begin(onProgress: (progressPct: number) => void): Promise<void> {
        const stream = fs.createWriteStream(this.fsLocation, { flags: 'w' });

        if (!stream) {
            throw new Error('Unable to open write stream');
        }

        const resp = await fetch(this.url);

        return new Promise<void>((res, reject) => {
            const contentLength = parseInt(resp.headers.get('Content-Length') ?? '0', 10);
            let receivedLength = 0;
            let lastReportedProgressPct = 0;
            resp.body.on('readable', async () => {
                let chunk;
                while (null !== (chunk = resp.body.read())) {
                    receivedLength += chunk.length;
                    stream.write(chunk);
                    const progress = (receivedLength * 100) / contentLength;
                    if (progress - lastReportedProgressPct > 1) {
                        lastReportedProgressPct = progress;
                        onProgress(progress);
                        log.info(`Received ${receivedLength} of ${contentLength} (${progress})`);
                    }
                }
            });
            resp.body.on('end', () => {
                log.info('Download complete');
                stream?.close();
                res();
            });

            resp.body.on('error', (e: Error) => {
                log.warn('Download complete with error', e);
                stream?.close();
                reject(e);
            });
        });
    }
}