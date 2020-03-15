define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Promises = /** @class */ (function () {
        function Promises() {
        }
        Promises.delay = function (ms) {
            return new Promise(function (resolve) {
                setTimeout(resolve, ms);
            });
        };
        return Promises;
    }());
    exports.Promises = Promises;
});
//# sourceMappingURL=Promises.js.map