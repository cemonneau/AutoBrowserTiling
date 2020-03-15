var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "../libs/VueAnnotate/VueAnnotate", "../Uuid"], function (require, exports, VueAnnotate_1, Uuid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TradingviewWidget = /** @class */ (function (_super) {
        __extends(TradingviewWidget, _super);
        function TradingviewWidget() {
            var _this = _super.call(this) || this;
            _this.widget = null;
            _this.containerId = Uuid_1.Uuid.v4();
            return _this;
        }
        TradingviewWidget.prototype.mounted = function () {
            var _this = this;
            try {
                TradingviewWidget.loadTradingviewApi().then(function () {
                    _this.widget = new window.TradingView.widget({
                        autosize: true,
                        symbol: _this.componentData.symbol,
                        interval: _this.componentData.defaultInterval,
                        timezone: "Etc/UTC",
                        theme: _this.componentData.light ? 'Light' : 'Dark',
                        "style": "1",
                        "locale": "en",
                        "toolbar_bg": "#f1f3f6",
                        enable_publishing: _this.componentData.enablePublishing,
                        hide_top_toolbar: _this.componentData.hideTopToolbar,
                        hide_legend: _this.componentData.hideLegend,
                        save_image: _this.componentData.saveImage,
                        container_id: _this.containerId,
                        allow_symbol_change: _this.componentData.allowSymbolChange,
                        hide_side_toolbar: _this.componentData.hideSideToolbar,
                    });
                    console.log(_this.widget);
                    window.widget = _this.widget;
                    // this.widget.getSymbolInfo(console.log);
                }).catch(function (e) { return console.error(e); });
            }
            catch (e) {
                console.error(e);
            }
        };
        TradingviewWidget.getDefaultData = function () {
            return {
                symbol: 'NASDAQ:AAPL',
                saveImage: false,
                hideLegend: false,
                hideTopToolbar: false,
                light: false,
                defaultInterval: '60',
                hideSideToolbar: false,
                allowSymbolChange: false,
                enablePublishing: false,
            };
        };
        TradingviewWidget.loadTradingviewApi = function () {
            if (TradingviewWidget.tradingviewLoaded)
                return Promise.resolve();
            else if (TradingviewWidget.tradingviewLoading)
                return TradingviewWidget.tradingviewLoading;
            TradingviewWidget.tradingviewLoading = new Promise(function (resolve, reject) {
                (function (d, script) {
                    if (script === void 0) { script = undefined; }
                    script = d.createElement('script');
                    script.type = 'text/javascript';
                    script.async = true;
                    script.onload = function () {
                        TradingviewWidget.tradingviewLoaded = true;
                        resolve();
                    };
                    script.src = 'https://s3.tradingview.com/tv.js';
                    d.getElementsByTagName('head')[0].appendChild(script);
                }(document));
            });
            return TradingviewWidget.tradingviewLoading;
        };
        TradingviewWidget.template = "<div style=\"width:100%;height:100%;\" :id=\"containerId\"></div>";
        TradingviewWidget.tradingviewLoaded = false;
        TradingviewWidget.tradingviewLoading = null;
        __decorate([
            VueAnnotate_1.VueParam()
        ], TradingviewWidget.prototype, "componentData", void 0);
        __decorate([
            VueAnnotate_1.VueParam()
        ], TradingviewWidget.prototype, "cellOptions", void 0);
        __decorate([
            VueAnnotate_1.VueVar()
        ], TradingviewWidget.prototype, "containerId", void 0);
        __decorate([
            VueAnnotate_1.VueMounted()
        ], TradingviewWidget.prototype, "mounted", null);
        return TradingviewWidget;
    }(VueAnnotate_1.VueVirtualComponent));
    exports.TradingviewWidget = TradingviewWidget;
});
//# sourceMappingURL=TradingviewWidget.js.map