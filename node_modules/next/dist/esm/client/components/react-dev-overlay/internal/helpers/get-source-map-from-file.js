import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import dataUriToBuffer from 'next/dist/compiled/data-uri-to-buffer';
import { getSourceMapUrl } from './get-source-map-url';
export async function getSourceMapFromFile(filename) {
    filename = filename.startsWith('file://') ? url.fileURLToPath(filename) : filename;
    let fileContents;
    try {
        fileContents = await fs.readFile(filename, 'utf-8');
    } catch (error) {
        throw new Error("Failed to read file contents of " + filename + ".", {
            cause: error
        });
    }
    const sourceUrl = getSourceMapUrl(fileContents);
    if (!sourceUrl) {
        return undefined;
    }
    if (sourceUrl.startsWith('data:')) {
        let buffer;
        try {
            buffer = dataUriToBuffer(sourceUrl);
        } catch (error) {
            throw new Error("Failed to parse source map URL for " + filename + ".", {
                cause: error
            });
        }
        if (buffer.type !== 'application/json') {
            throw new Error("Unknown source map type for " + filename + ": " + buffer.typeFull + ".");
        }
        try {
            return JSON.parse(buffer.toString());
        } catch (error) {
            throw new Error("Failed to parse source map for " + filename + ".", {
                cause: error
            });
        }
    }
    const sourceMapFilename = path.resolve(path.dirname(filename), decodeURIComponent(sourceUrl));
    try {
        const sourceMapContents = await fs.readFile(sourceMapFilename, 'utf-8');
        return JSON.parse(sourceMapContents.toString());
    } catch (error) {
        throw new Error("Failed to parse source map " + sourceMapFilename + ".", {
            cause: error
        });
    }
}

//# sourceMappingURL=get-source-map-from-file.js.map