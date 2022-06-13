import electron, { ipcMain } from "electron";
import log from "electron-log";
import { FileDownloader } from "./utils/FileDownloader";
import { spawn } from 'child_process';
import axios from 'axios';
import fs from 'fs-extra';
import FormData from 'form-data';
import got from 'got';

const ISRGCAs = [`-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw
TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh
cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4
WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJu
ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBY
MTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK3oJHP0FDfzm54rVygc
h77ct984kIxuPOZXoHj3dcKi/vVqbvYATyjb3miGbESTtrFj/RQSa78f0uoxmyF+
0TM8ukj13Xnfs7j/EvEhmkvBioZxaUpmZmyPfjxwv60pIgbz5MDmgK7iS4+3mX6U
A5/TR5d8mUgjU+g4rk8Kb4Mu0UlXjIB0ttov0DiNewNwIRt18jA8+o+u3dpjq+sW
T8KOEUt+zwvo/7V3LvSye0rgTBIlDHCNAymg4VMk7BPZ7hm/ELNKjD+Jo2FR3qyH
B5T0Y3HsLuJvW5iB4YlcNHlsdu87kGJ55tukmi8mxdAQ4Q7e2RCOFvu396j3x+UC
B5iPNgiV5+I3lg02dZ77DnKxHZu8A/lJBdiB3QW0KtZB6awBdpUKD9jf1b0SHzUv
KBds0pjBqAlkd25HN7rOrFleaJ1/ctaJxQZBKT5ZPt0m9STJEadao0xAH0ahmbWn
OlFuhjuefXKnEgV4We0+UXgVCwOPjdAvBbI+e0ocS3MFEvzG6uBQE3xDk3SzynTn
jh8BCNAw1FtxNrQHusEwMFxIt4I7mKZ9YIqioymCzLq9gwQbooMDQaHWBfEbwrbw
qHyGO0aoSCqI3Haadr8faqU9GY/rOPNk3sgrDQoo//fb4hVC1CLQJ13hef4Y53CI
rU7m2Ys6xt0nUW7/vGT1M0NPAgMBAAGjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNV
HRMBAf8EBTADAQH/MB0GA1UdDgQWBBR5tFnme7bl5AFzgAiIyBpY9umbbjANBgkq
hkiG9w0BAQsFAAOCAgEAVR9YqbyyqFDQDLHYGmkgJykIrGF1XIpu+ILlaS/V9lZL
ubhzEFnTIZd+50xx+7LSYK05qAvqFyFWhfFQDlnrzuBZ6brJFe+GnY+EgPbk6ZGQ
3BebYhtF8GaV0nxvwuo77x/Py9auJ/GpsMiu/X1+mvoiBOv/2X/qkSsisRcOj/KK
NFtY2PwByVS5uCbMiogziUwthDyC3+6WVwW6LLv3xLfHTjuCvjHIInNzktHCgKQ5
ORAzI4JMPJ+GslWYHb4phowim57iaztXOoJwTdwJx4nLCgdNbOhdjsnvzqvHu7Ur
TkXWStAmzOVyyghqpZXjFaH3pO3JLF+l+/+sKAIuvtd7u+Nxe5AW0wdeRlN8NwdC
jNPElpzVmbUq4JUagEiuTDkHzsxHpFKVK7q4+63SM1N95R1NbdWhscdCb+ZAJzVc
oyi3B43njTOQ5yOf+1CceWxG1bQVs5ZufpsMljq4Ui0/1lvh+wjChP4kqKOJ2qxq
4RgqsahDYVvTH9w7jXbyLeiNdd8XM2w9U/t7y0Ff/9yi0GE44Za4rF2LN9d11TPA
mRGunUHBcnWEvgJBQl9nJEiU0Zsnvgc/ubhPgXRR4Xq37Z0j4r7g1SgEEzwxA57d
emyPxgcYxn/eR44/KJ4EBs+lVDR3veyJm+kXQ99b21/+jh5Xos1AnX5iItreGCc=
-----END CERTIFICATE-----`];

axios.defaults.adapter = require('axios/lib/adapters/xhr.js');

export class IpcCommandHandler {
    private mainWindow: electron.BrowserWindow | null = null;
    constructor() { }

    public setMainWindow(mainWindow: electron.BrowserWindow) {
        this.mainWindow = mainWindow;
    }

    public registerAll() {
        ipcMain.handle('downloadFile', this.onDownloadFile.bind(this));
        ipcMain.handle('buildGallery', this.buildGallery.bind(this));
        ipcMain.handle('upload-zip', this.uploadZip.bind(this));
    }

    private async onDownloadFile(_event: any, args: { outputLocation: string, url: string }) {
        const downloader = new FileDownloader(args.outputLocation, args.url);
        try {
            await downloader.begin(progress => this.mainWindow?.webContents.send('downloadProgress', progress));
            log.info('Download complete in main');
        } catch (e) {
            return e;
        }
    }

    private async uploadZip(_event: any, cmd: { sourceFile: string, uploadUrl: string, token: string }) {
        const onProgress = (progress: number) => {
            this.mainWindow?.webContents.send('upload-progress', progress);
        };
        const { sourceFile, uploadUrl, token } = cmd;
        log.info(`Source File: ${sourceFile}`);
        log.info(`Upload URL: ${uploadUrl}`);
        const fileDetails = fs.statSync(sourceFile);

        if (fileDetails.size / 1000000.0 > 200) {
            throw Error('File is too large. Must be less than 200MB!');
        }

        const fileStream = fs.createReadStream(sourceFile);

        const formData = new FormData()

        formData.append('file', fileStream, 'pack');

        let lastUploadProgress = -1;
        try {
            await got.post(`${uploadUrl}/v2/packsmultipart`, {
                body: formData,
                https: {
                    certificateAuthority: ISRGCAs
                },
                headers: {
                    ...formData.getHeaders(),
                    Authorization: `Bearer ${token}`
                }
            }).on('uploadProgress', progress => {
                const progressInt = Math.round(progress.percent * 100);
    
                if(progressInt !== lastUploadProgress) {
                    onProgress(progressInt);
                }
                lastUploadProgress = progressInt;
            });
        } catch(e: any) {
            log.error('Upload error: ' + e.message);
            log.error(e.response.body);
            throw Error(`${e.message} (${e?.response?.body ?? 'No additional details available'})`);
        }

    }

    private async buildGallery(_event: any, cmdArgs: { command: string, args: Array<string> }) {
        const { args, command } = cmdArgs;
        const onOutput = (lines: string) => {
            this.mainWindow?.webContents.send('gallery-stdout', lines)
        };
        return new Promise((resolve, reject) => {
            onOutput(`Executing command ${command} with args [${args.join(',')}]`);
            const process = spawn(command, args);

            process.stdout.on('data', data => {
                onOutput(data.toString());
            });

            process.stderr.on('data', data => {
                onOutput(data.toString());
            });

            process.on('exit', code => {
                log.info(`Process exiting with code ${code}`);
                if (code !== 0) {
                    log.warn('Error building gallery. Process exited with code ' + code);
                }

                resolve(code);
            });
        });
    }
}
