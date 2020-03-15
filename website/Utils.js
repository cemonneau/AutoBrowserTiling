define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Utils = /** @class */ (function () {
        function Utils() {
        }
        Utils.askFileContent = function () {
            var _this = this;
            var self = this;
            var readFile = function (e) {
                if (!e || !e.target) {
                    if (self.fileReader_promiseReject)
                        self.fileReader_promiseReject('no target');
                    return;
                }
                var target = e.target;
                if (!target.files) {
                    if (self.fileReader_promiseReject)
                        self.fileReader_promiseReject('no target');
                    return;
                }
                var file = target.files[0];
                if (!file) {
                    if (self.fileReader_promiseReject)
                        self.fileReader_promiseReject('cant open file');
                }
                var reader = new FileReader();
                reader.onload = function () {
                    if (self.fileReader_promiseResolve)
                        self.fileReader_promiseResolve(reader.result);
                };
                reader.onerror = function (e) {
                    if (self.fileReader_promiseReject)
                        self.fileReader_promiseReject(e);
                };
                reader.readAsText(file);
            };
            var inputElementExisting = document.getElementById('socialManager_ui_fileReader');
            if (inputElementExisting && inputElementExisting.parentNode) {
                inputElementExisting.parentNode.removeChild(inputElementExisting);
                inputElementExisting = null;
            }
            if (!inputElementExisting) {
                var fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.style.display = 'none';
                fileInput.onchange = readFile;
                fileInput.setAttribute('id', 'socialManager_ui_fileReader');
                document.body.appendChild(fileInput);
                inputElementExisting = fileInput;
            }
            return new Promise(function (resolve, reject) {
                _this.fileReader_promiseResolve = resolve;
                _this.fileReader_promiseReject = reject;
                // $(<any>inputElementExisting).trigger('click');
                if (inputElementExisting)
                    inputElementExisting.click();
            });
        };
        Utils.fileReader_promiseResolve = null;
        Utils.fileReader_promiseReject = null;
        return Utils;
    }());
    exports.Utils = Utils;
});
//# sourceMappingURL=Utils.js.map