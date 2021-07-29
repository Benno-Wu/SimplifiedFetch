var pipes = (function (exports) {
    'use strict';

    const NoRequest = (url, config, [body, params], [api, urn, config_, baseConfig]) => {
        console.log(`try fetch ${url}, blocked by NoRepuest Pipe`);
        return 'No Request';
    };
    const RequestLogger = (url, config, [body, params, dynamicConfig], [api, urn, config_, baseConfig]) => {
        console.log('RequestLogger begin');
        console.log(url.toString(), JSON.stringify(config), JSON.stringify([body, params, dynamicConfig]), JSON.stringify([api, urn, config_, baseConfig]));
        console.log('RequestLogger end');
    };
    const RequestDelay = (delay) => async () => {
        await new Promise(resolve => setTimeout(resolve, delay));
    };

    exports.NoRequest = NoRequest;
    exports.RequestDelay = RequestDelay;
    exports.RequestLogger = RequestLogger;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
