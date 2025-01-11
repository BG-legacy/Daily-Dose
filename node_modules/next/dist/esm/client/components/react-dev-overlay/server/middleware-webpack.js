import { constants as FS, promises as fs } from 'fs';
import path from 'path';
import url from 'url';
import { SourceMapConsumer } from 'next/dist/compiled/source-map08';
import { getSourceMapFromFile } from '../internal/helpers/get-source-map-from-file';
import { launchEditor } from '../internal/helpers/launchEditor';
import { badRequest, getOriginalCodeFrame, internalServerError, json, noContent } from './shared';
export { getServerError } from '../internal/helpers/node-stack-frames';
export { parseStack } from '../internal/helpers/parse-stack';
export { getSourceMapFromFile };
import { formatFrameSourceFile } from '../internal/helpers/webpack-module-path';
function shouldIgnorePath(modulePath) {
    return modulePath.includes('node_modules') || // Only relevant for when Next.js is symlinked e.g. in the Next.js monorepo
    modulePath.includes('next/dist');
}
function getModuleById(id, compilation) {
    const { chunkGraph, modules } = compilation;
    return [
        ...modules
    ].find((module)=>chunkGraph.getModuleId(module) === id);
}
function findModuleNotFoundFromError(errorMessage) {
    var _errorMessage_match;
    return errorMessage == null ? void 0 : (_errorMessage_match = errorMessage.match(/'([^']+)' module/)) == null ? void 0 : _errorMessage_match[1];
}
function getSourcePath(source) {
    return source.replace(/^(webpack:\/\/\/|webpack:\/\/|webpack:\/\/_N_E\/)/, '');
}
async function findOriginalSourcePositionAndContent(sourceMap, position) {
    const consumer = await new SourceMapConsumer(sourceMap);
    try {
        var _position_column;
        const sourcePosition = consumer.originalPositionFor({
            line: position.line,
            column: (_position_column = position.column) != null ? _position_column : 0
        });
        if (!sourcePosition.source) {
            return null;
        }
        var _consumer_sourceContentFor;
        const sourceContent = (_consumer_sourceContentFor = consumer.sourceContentFor(sourcePosition.source, /* returnNullOnMissing */ true)) != null ? _consumer_sourceContentFor : null;
        return {
            sourcePosition,
            sourceContent
        };
    } finally{
        consumer.destroy();
    }
}
export function getIgnoredSources(sourceMap) {
    const ignoreList = new Set();
    var _sourceMap_sources;
    const moduleFilenames = (_sourceMap_sources = sourceMap == null ? void 0 : sourceMap.sources) != null ? _sourceMap_sources : [];
    for(let index = 0; index < moduleFilenames.length; index++){
        // bundlerFilePath case: webpack://./app/page.tsx
        const bundlerFilePath = moduleFilenames[index];
        // Format the path to the normal file path
        const formattedFilePath = formatFrameSourceFile(bundlerFilePath);
        if (shouldIgnorePath(formattedFilePath)) {
            ignoreList.add(index);
        }
    }
    const ignoredSources = sourceMap.sources.map((source, index)=>{
        var _sourceMap_sourcesContent;
        var _sourceMap_sourcesContent_index;
        return {
            url: source,
            ignored: ignoreList.has(sourceMap.sources.indexOf(source)),
            content: (_sourceMap_sourcesContent_index = (_sourceMap_sourcesContent = sourceMap.sourcesContent) == null ? void 0 : _sourceMap_sourcesContent[index]) != null ? _sourceMap_sourcesContent_index : null
        };
    });
    return ignoredSources;
}
function isIgnoredSource(source, sourcePosition) {
    if (sourcePosition.source == null) {
        return true;
    }
    for (const ignoredSource of source.ignoredSources){
        if (ignoredSource.ignored && ignoredSource.url === sourcePosition.source) {
            return true;
        }
    }
    return false;
}
function createStackFrame(searchParams) {
    const file = searchParams.get('file');
    var _searchParams_get, _searchParams_get1;
    return {
        file,
        methodName: searchParams.get('methodName'),
        lineNumber: parseInt((_searchParams_get = searchParams.get('lineNumber')) != null ? _searchParams_get : '0', 10) || 0,
        column: parseInt((_searchParams_get1 = searchParams.get('column')) != null ? _searchParams_get1 : '0', 10) || 0,
        arguments: searchParams.getAll('arguments').filter(Boolean)
    };
}
function findOriginalSourcePositionAndContentFromCompilation(moduleId, importedModule, compilation) {
    var _module_buildInfo_importLocByPath, _module_buildInfo;
    const module = getModuleById(moduleId, compilation);
    var _module_buildInfo_importLocByPath_get;
    return (_module_buildInfo_importLocByPath_get = module == null ? void 0 : (_module_buildInfo = module.buildInfo) == null ? void 0 : (_module_buildInfo_importLocByPath = _module_buildInfo.importLocByPath) == null ? void 0 : _module_buildInfo_importLocByPath.get(importedModule)) != null ? _module_buildInfo_importLocByPath_get : null;
}
export async function createOriginalStackFrame(param) {
    let { source, rootDirectory, frame, errorMessage } = param;
    var // default is not a valid identifier in JS so webpack uses a custom variable when it's an unnamed default export
    // Resolve it back to `default` for the method name if the source position didn't have the method.
    _frame_methodName_replace, _frame_methodName;
    const { lineNumber, column } = frame;
    const moduleNotFound = findModuleNotFoundFromError(errorMessage);
    const result = await (async ()=>{
        if (moduleNotFound) {
            if (source.type === 'file') {
                return undefined;
            }
            return findOriginalSourcePositionAndContentFromCompilation(source.moduleId, moduleNotFound, source.compilation);
        }
        // This returns 1-based lines and 0-based columns
        return await findOriginalSourcePositionAndContent(source.sourceMap, {
            line: lineNumber != null ? lineNumber : 1,
            column
        });
    })();
    if (!result) {
        return null;
    }
    const { sourcePosition, sourceContent } = result;
    if (!sourcePosition.source) {
        return null;
    }
    const ignored = isIgnoredSource(source, sourcePosition) || // If the source file is externals, should be excluded even it's not ignored source.
    // e.g. webpack://next/dist/.. needs to be ignored
    shouldIgnorePath(source.modulePath);
    const sourcePath = getSourcePath(// When sourcePosition.source is the loader path the modulePath is generally better.
    (sourcePosition.source.includes('|') ? source.modulePath : sourcePosition.source) || source.modulePath);
    const filePath = path.resolve(rootDirectory, sourcePath);
    const resolvedFilePath = sourceContent ? path.relative(rootDirectory, filePath) : sourcePosition.source;
    var _sourcePosition_column;
    const traced = {
        file: resolvedFilePath,
        lineNumber: sourcePosition.line,
        column: ((_sourcePosition_column = sourcePosition.column) != null ? _sourcePosition_column : 0) + 1,
        methodName: sourcePosition.name || ((_frame_methodName = frame.methodName) == null ? void 0 : (_frame_methodName_replace = _frame_methodName.replace('__WEBPACK_DEFAULT_EXPORT__', 'default')) == null ? void 0 : _frame_methodName_replace.replace('__webpack_exports__.', '')),
        arguments: [],
        ignored
    };
    return {
        originalStackFrame: traced,
        originalCodeFrame: getOriginalCodeFrame(traced, sourceContent)
    };
}
async function getSourceMapFromCompilation(id, compilation) {
    try {
        const module = getModuleById(id, compilation);
        if (!module) {
            return undefined;
        }
        // @ts-expect-error The types for `CodeGenerationResults.get` require a
        // runtime to be passed as second argument, but apparently it also works
        // without it.
        const codeGenerationResult = compilation.codeGenerationResults.get(module);
        const source = codeGenerationResult == null ? void 0 : codeGenerationResult.sources.get('javascript');
        var _source_map;
        return (_source_map = source == null ? void 0 : source.map()) != null ? _source_map : undefined;
    } catch (err) {
        console.error('Failed to lookup module by ID ("' + id + '"):', err);
        return undefined;
    }
}
async function getSource(filename, options) {
    const { getCompilations } = options;
    if (path.isAbsolute(filename)) {
        filename = url.pathToFileURL(filename).href;
    }
    if (filename.startsWith('file:')) {
        const sourceMap = await getSourceMapFromFile(filename);
        return sourceMap ? {
            type: 'file',
            sourceMap,
            ignoredSources: getIgnoredSources(sourceMap),
            modulePath: filename.replace(/^file:\/\//, '')
        } : undefined;
    }
    // webpack-internal:///./src/hello.tsx => ./src/hello.tsx
    // rsc://React/Server/webpack-internal:///(rsc)/./src/hello.tsx?42 => (rsc)/./src/hello.tsx
    // webpack://_N_E/./src/hello.tsx => ./src/hello.tsx
    const moduleId = filename.replace(/^(rsc:\/\/React\/[^/]+\/)?(webpack-internal:\/\/\/|webpack:\/\/(_N_E\/)?)/, '').replace(/\?\d+$/, '');
    // (rsc)/./src/hello.tsx => ./src/hello.tsx
    const modulePath = moduleId.replace(/^(\(.*\)\/?)/, '');
    for (const compilation of getCompilations()){
        const sourceMap = await getSourceMapFromCompilation(moduleId, compilation);
        const ignoreList = [];
        var _sourceMap_sources;
        const moduleFilenames = (_sourceMap_sources = sourceMap == null ? void 0 : sourceMap.sources) != null ? _sourceMap_sources : [];
        for(let index = 0; index < moduleFilenames.length; index++){
            // bundlerFilePath case: webpack://./app/page.tsx
            const bundlerFilePath = moduleFilenames[index];
            // Format the path to the normal file path
            const formattedFilePath = formatFrameSourceFile(bundlerFilePath);
            if (shouldIgnorePath(formattedFilePath)) {
                ignoreList.push(index);
            }
        }
        if (sourceMap) {
            const ignoredSources = getIgnoredSources(sourceMap);
            return {
                type: 'bundle',
                sourceMap,
                compilation,
                moduleId,
                modulePath,
                ignoredSources
            };
        }
    }
    return undefined;
}
export function getOverlayMiddleware(options) {
    const { rootDirectory, clientStats, serverStats, edgeServerStats } = options;
    return async function(req, res, next) {
        const { pathname, searchParams } = new URL("http://n" + req.url);
        if (pathname === '/__nextjs_original-stack-frame') {
            const isServer = searchParams.get('isServer') === 'true';
            const isEdgeServer = searchParams.get('isEdgeServer') === 'true';
            const isAppDirectory = searchParams.get('isAppDirectory') === 'true';
            const frame = createStackFrame(searchParams);
            let source;
            try {
                source = await getSource(frame.file, {
                    getCompilations: ()=>{
                        const compilations = [];
                        // Try Client Compilation first. In `pages` we leverage
                        // `isClientError` to check. In `app` it depends on if it's a server
                        // / client component and when the code throws. E.g. during HTML
                        // rendering it's the server/edge compilation.
                        if (!isEdgeServer && !isServer || isAppDirectory) {
                            var _clientStats;
                            const compilation = (_clientStats = clientStats()) == null ? void 0 : _clientStats.compilation;
                            if (compilation) {
                                compilations.push(compilation);
                            }
                        }
                        // Try Server Compilation. In `pages` this could be something
                        // imported in getServerSideProps/getStaticProps as the code for
                        // those is tree-shaken. In `app` this finds server components and
                        // code that was imported from a server component. It also covers
                        // when client component code throws during HTML rendering.
                        if (isServer || isAppDirectory) {
                            var _serverStats;
                            const compilation = (_serverStats = serverStats()) == null ? void 0 : _serverStats.compilation;
                            if (compilation) {
                                compilations.push(compilation);
                            }
                        }
                        // Try Edge Server Compilation. Both cases are the same as Server
                        // Compilation, main difference is that it covers `runtime: 'edge'`
                        // pages/app routes.
                        if (isEdgeServer || isAppDirectory) {
                            var _edgeServerStats;
                            const compilation = (_edgeServerStats = edgeServerStats()) == null ? void 0 : _edgeServerStats.compilation;
                            if (compilation) {
                                compilations.push(compilation);
                            }
                        }
                        return compilations;
                    }
                });
            } catch (err) {
                console.error('Failed to get source map:', err);
                return internalServerError(res);
            }
            var _frame_column;
            // This stack frame is used for the one that couldn't locate the source or source mapped frame
            const defaultStackFrame = {
                file: frame.file,
                lineNumber: frame.lineNumber,
                column: (_frame_column = frame.column) != null ? _frame_column : 1,
                methodName: frame.methodName,
                ignored: shouldIgnorePath(frame.file),
                arguments: []
            };
            if (!source) {
                // return original stack frame with no source map
                return json(res, {
                    originalStackFrame: defaultStackFrame,
                    originalCodeFrame: null
                });
            }
            try {
                const originalStackFrameResponse = await createOriginalStackFrame({
                    frame,
                    source,
                    rootDirectory
                });
                if (!originalStackFrameResponse) {
                    return json(res, {
                        originalStackFrame: defaultStackFrame,
                        originalCodeFrame: null
                    });
                }
                return json(res, originalStackFrameResponse);
            } catch (err) {
                console.log('Failed to parse source map:', err);
                return internalServerError(res);
            }
        } else if (pathname === '/__nextjs_launch-editor') {
            const frame = createStackFrame(searchParams);
            if (!frame.file) return badRequest(res);
            // frame files may start with their webpack layer, like (middleware)/middleware.js
            const filePath = path.resolve(rootDirectory, frame.file.replace(/^\([^)]+\)\//, ''));
            const fileExists = await fs.access(filePath, FS.F_OK).then(()=>true, ()=>false);
            if (!fileExists) return noContent(res);
            try {
                var _frame_column1;
                await launchEditor(filePath, frame.lineNumber, (_frame_column1 = frame.column) != null ? _frame_column1 : 1);
            } catch (err) {
                console.log('Failed to launch editor:', err);
                return internalServerError(res);
            }
            return noContent(res);
        }
        return next();
    };
}
export function getSourceMapMiddleware(options) {
    const { clientStats, serverStats, edgeServerStats } = options;
    return async function(req, res, next) {
        const { pathname, searchParams } = new URL("http://n" + req.url);
        if (pathname !== '/__nextjs_source-map') {
            return next();
        }
        const filename = searchParams.get('filename');
        if (!filename) {
            return badRequest(res);
        }
        let source;
        try {
            source = await getSource(filename, {
                getCompilations: ()=>{
                    const compilations = [];
                    for (const stats of [
                        clientStats(),
                        serverStats(),
                        edgeServerStats()
                    ]){
                        if (stats == null ? void 0 : stats.compilation) {
                            compilations.push(stats.compilation);
                        }
                    }
                    return compilations;
                }
            });
        } catch (error) {
            console.error('Failed to get source map:', error);
            return internalServerError(res);
        }
        if (!source) {
            return noContent(res);
        }
        return json(res, source.sourceMap);
    };
}

//# sourceMappingURL=middleware-webpack.js.map