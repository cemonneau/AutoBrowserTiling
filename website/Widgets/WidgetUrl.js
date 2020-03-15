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
define(["require", "exports", "../libs/VueAnnotate/VueAnnotate"], function (require, exports, VueAnnotate_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WidgetUrl = /** @class */ (function (_super) {
        __extends(WidgetUrl, _super);
        function WidgetUrl() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        WidgetUrl.getDefaultData = function () {
            return {
                url: 'https://google.fr'
            };
        };
        WidgetUrl.template = "<div style=\"width:100%;height:100%;\">\n\t\t\t<iframe v-if=\"componentData.url && componentData.url.length > 0\" :src=\"componentData.url\" :scrolling=\"cellOptions.hideOverflow ? 'no' : 'auto'\"></iframe>\n\t\t</div>";
        __decorate([
            VueAnnotate_1.VueParam()
        ], WidgetUrl.prototype, "componentData", void 0);
        __decorate([
            VueAnnotate_1.VueParam()
        ], WidgetUrl.prototype, "cellOptions", void 0);
        return WidgetUrl;
    }(VueAnnotate_1.VueVirtualComponent));
    exports.WidgetUrl = WidgetUrl;
});
//# sourceMappingURL=WidgetUrl.js.map