var pipes = (function (exports) {
    'use strict';

    var NoRequest = function (url, config, _a, _b) {
        _a[0]; _a[1];
        _b[0]; _b[1]; _b[2]; _b[3];
        console.log("try fetch " + url + ", blocked by NoRepuest Pipe");
        return 'No Request';
    };
    var RequestLogger = function (url, config, _a, _b) {
        var body = _a[0], params = _a[1];
        var api = _b[0], urn = _b[1], config_ = _b[2], baseConfig = _b[3];
        console.log(url.toString(), JSON.stringify(config), JSON.stringify([body, params]), JSON.stringify([api, urn, config_, baseConfig]));
    };

    exports.NoRequest = NoRequest;
    exports.RequestLogger = RequestLogger;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
