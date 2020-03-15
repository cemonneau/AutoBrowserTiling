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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "./libs/VueAnnotate/VueAnnotate", "./Utils", "./Uuid", "./Widgets/WidgetUrl", "./Widgets/TradingviewWidget"], function (require, exports, VueAnnotate_1, Utils_1, Uuid_1, WidgetUrl_1, TradingviewWidget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var extensionId = window.location.href.startsWith('http://localhost') ? 'omkoogckomimodfhcfkbpmflamheipfb' : 'mjoenlgcmnkonkmnjmlebkojpfcnkjfk';
    function isExtensionInstalled() {
        return new Promise(function (resolve, reject) {
            chrome.runtime.sendMessage(extensionId, { message: "version" }, function (reply) {
                if (reply) {
                    if (reply.version) {
                        resolve(true);
                    }
                    else
                        resolve(false);
                }
                else {
                    resolve(false);
                }
            });
        });
    }
    var DisplayCellType;
    (function (DisplayCellType) {
        DisplayCellType["BLANK"] = "BLANK";
        DisplayCellType["URL"] = "URL";
        DisplayCellType["TRADINGVIEW"] = "TRADINGVIEW";
        DisplayCellType["TWITTER"] = "TWITTER";
    })(DisplayCellType || (DisplayCellType = {}));
    var App = /** @class */ (function (_super) {
        __extends(App, _super);
        function App(container, vueConstructorParams) {
            var _this = _super.call(this, vueConstructorParams) || this;
            _this.display = { rows: [], mergedCells: [] };
            _this.reloadCounterPerId = {};
            _this.optionsEnabled = false;
            _this.editedCell = null;
            _this.extensionIsInstalled = false;
            _this.intervalReloadCounter = 0;
            _this.currentFullscreenCell = null;
            _this.updateDisplay(_this.getDisplayLocally());
            isExtensionInstalled().then(function (installed) {
                _this.extensionIsInstalled = installed;
            });
            return _this;
        }
        App.prototype.getDefaultDisplay = function () {
            return {
                rows: [
                    {
                        cells: [
                            this.getDefaultCell()
                        ],
                    },
                ],
                mergedCells: []
            };
        };
        App.prototype.getDefaultCellOptions = function () {
            return {
                reloadTimer: 0,
                hideOverflow: false,
                blackTimer: false,
                fullscreen: false,
            };
        };
        App.prototype.ensureDisplayConsistency = function (display) {
            for (var _i = 0, _a = display.rows; _i < _a.length; _i++) {
                var row = _a[_i];
                for (var _b = 0, _c = row.cells; _b < _c.length; _b++) {
                    var cell = _c[_b];
                    if (typeof cell.type === 'undefined')
                        cell.type = DisplayCellType.URL;
                }
            }
            return display;
        };
        App.prototype.getDefaultCell = function () {
            return { id: Uuid_1.Uuid.v4(), type: DisplayCellType.URL, data: { url: 'https://google.fr' }, options: this.getDefaultCellOptions() };
        };
        App.prototype.updateDisplay = function (display) {
            this.display = this.ensureDisplayConsistency(__assign(__assign({}, this.getDefaultDisplay()), display));
            var maxCells = 0;
            for (var _i = 0, _a = this.display.rows; _i < _a.length; _i++) {
                var row = _a[_i];
                if (maxCells < row.cells.length) {
                    maxCells = row.cells.length;
                }
            }
            for (var _b = 0, _c = this.display.rows; _b < _c.length; _b++) {
                var row = _c[_b];
                for (var i = 0; i < maxCells - row.cells.length; ++i)
                    row.cells.push(this.getDefaultCell());
            }
            this.updateCounters(true);
        };
        /*********************************************
         * Iframe Reload system (functional & display)
         *********************************************/
        App.prototype.updateCounters = function (recreateCounters) {
            var _this = this;
            if (recreateCounters === void 0) { recreateCounters = false; }
            if (recreateCounters)
                this.reloadCounterPerId = {};
            for (var _i = 0, _a = this.display.rows; _i < _a.length; _i++) {
                var row = _a[_i];
                for (var _b = 0, _c = row.cells; _b < _c.length; _b++) {
                    var cell = _c[_b];
                    if (cell.options && cell.options.reloadTimer) {
                        var reloadCssAnimation = false;
                        if (typeof this.reloadCounterPerId[cell.id] === 'undefined') {
                            this.reloadCounterPerId[cell.id] = cell.options.reloadTimer;
                            reloadCssAnimation = true;
                        }
                        else {
                            this.reloadCounterPerId[cell.id]--;
                            if (this.reloadCounterPerId[cell.id] <= 0) {
                                this.reloadCounterPerId[cell.id] = cell.options.reloadTimer;
                                var jiframe = $('div.cell[data-id=' + cell.id + '] iframe');
                                jiframe.attr('src', jiframe.attr('src'));
                                reloadCssAnimation = true;
                            }
                        }
                        if (reloadCssAnimation) {
                            this.resetCssAnimation($('div.cell[data-id=' + cell.id + '] .countdown circle'));
                        }
                    }
                }
            }
            if (this.intervalReloadCounter === 0 || recreateCounters) {
                if (this.intervalReloadCounter)
                    clearInterval(this.intervalReloadCounter);
                this.intervalReloadCounter = setInterval(function () {
                    _this.updateCounters();
                }, 1000);
            }
            this.$forceUpdate();
        };
        App.prototype.resetCssAnimation = function (jContainer) {
            var val = jContainer.css('animation');
            jContainer.css('animation', 'none');
            setTimeout(function () {
                jContainer.css('animation', val);
            }, 10);
        };
        /*********************************************
         * Display functions for rows & cells
         *********************************************/
        App.prototype.getOptionsForCell = function (cell) {
            return __assign(__assign({}, this.getDefaultCellOptions()), cell.options);
        };
        App.prototype.getStyledOptionsForCell = function (cell) {
            var options = this.getOptionsForCell(cell);
            return {
                'overflow': options.hideOverflow ? 'hidden' : 'none',
            };
        };
        App.prototype.getRowHeightInPercent = function (row) {
            return 100 / this.display.rows.length;
        };
        App.prototype.getStyleForRow = function (row) {
            return { height: this.getRowHeightInPercent(row) + '%' };
        };
        App.prototype.getStyleForCell = function (row, cell) {
            var cellPos = this.getCellPosition(row, cell);
            var cellMerged = this.getCellMerged(cell.id, true);
            return __assign({
                width: (100 / row.cells.length * cellMerged.countHorizontal) + '%',
                height: (100 / this.display.rows.length * cellMerged.countVertical) + '%',
                left: (cellPos.x / row.cells.length * 100) + '%',
                top: (cellPos.y / this.display.rows.length * 100) + '%',
            }, this.getStyledOptionsForCell(cell));
        };
        /**
         * If a cell is not visible due to another one overlapping it do not show it
         * @param row
         * @param cell
         */
        App.prototype.isCellVisible = function (row, cell) {
            return cell.type !== DisplayCellType.BLANK;
        };
        App.prototype.getCellMerged = function (cellId, returnIdentityMerge) {
            if (returnIdentityMerge === void 0) { returnIdentityMerge = false; }
            for (var _i = 0, _a = this.display.mergedCells; _i < _a.length; _i++) {
                var mergedCellSearch = _a[_i];
                if (mergedCellSearch.primaryId === cellId)
                    return mergedCellSearch;
            }
            return returnIdentityMerge ? { primaryId: cellId, countHorizontal: 1, countVertical: 1 } : null;
        };
        App.prototype.getCellPosition = function (row, cell) {
            var y = 0, x = 0;
            for (var _i = 0, _a = this.display.rows; _i < _a.length; _i++) {
                var rowSearch = _a[_i];
                if (rowSearch === row) {
                    for (var _b = 0, _c = rowSearch.cells; _b < _c.length; _b++) {
                        var cellSearch = _c[_b];
                        if (cellSearch === cell) {
                            break;
                        }
                        ++x;
                    }
                    break;
                }
                ++y;
            }
            return {
                x: x,
                y: y,
            };
        };
        App.prototype.toggleFullscreenCell = function (row, cell) {
            if (this.currentFullscreenCell !== null)
                this.currentFullscreenCell = null;
            else
                this.currentFullscreenCell = cell;
        };
        /*********************************************
         * Options management
         *********************************************/
        App.prototype.toggleOptions = function () {
            this.optionsEnabled = !this.optionsEnabled;
        };
        App.prototype.addRow = function () {
            var emptyCells = [];
            for (var i = 0; i < this.display.rows[0].cells.length; ++i) {
                emptyCells.push(this.getDefaultCell());
            }
            var newRow = {
                cells: emptyCells,
            };
            this.display.rows.push(newRow);
            this.updateCounters(true); //as it triggers HTML refresh
        };
        App.prototype.removeRow = function () {
            if (this.display.rows.length > 1)
                this.display.rows.splice(this.display.rows.length - 1, 1);
        };
        App.prototype.addCell = function () {
            for (var _i = 0, _a = this.display.rows; _i < _a.length; _i++) {
                var row = _a[_i];
                row.cells.push(this.getDefaultCell());
            }
            this.updateCounters(true); //as it triggers HTML refresh
        };
        App.prototype.removeCell = function () {
            for (var _i = 0, _a = this.display.rows; _i < _a.length; _i++) {
                var row = _a[_i];
                if (row.cells.length - 1 >= 1)
                    row.cells.splice(row.cells.length - 1, 1);
            }
            this.updateCounters(true); //as it triggers HTML refresh
        };
        App.prototype.editCell = function (cell) {
            this.editedCell = cell;
        };
        App.prototype.closeCellEditor = function () {
            this.editedCell = null;
            this.updateCounters(true); //as it triggers HTML refresh
        };
        App.prototype.editedCellTypeChanged = function (editedCell) {
            if (editedCell.type === DisplayCellType.URL)
                editedCell.data = WidgetUrl_1.WidgetUrl.getDefaultData();
            else if (editedCell.type === DisplayCellType.TRADINGVIEW)
                editedCell.data = TradingviewWidget_1.TradingviewWidget.getDefaultData();
        };
        App.prototype.extendCell = function (row, cell, direction) {
            var cellPos = this.getCellPosition(row, cell);
            var mergedCellExist = null;
            var oldSize = { x: 1, y: 1 };
            for (var _i = 0, _a = this.display.mergedCells; _i < _a.length; _i++) {
                var mergedCell = _a[_i];
                if (mergedCell.primaryId === cell.id) {
                    oldSize = { x: mergedCell.countHorizontal, y: mergedCell.countVertical };
                    mergedCell.countVertical += direction.y;
                    if (mergedCell.countVertical <= 0)
                        mergedCell.countVertical = 1;
                    mergedCell.countHorizontal += direction.x;
                    if (mergedCell.countHorizontal <= 0)
                        mergedCell.countHorizontal = 1;
                    mergedCellExist = mergedCell;
                    break;
                }
            }
            if (mergedCellExist === null) {
                mergedCellExist = {
                    primaryId: cell.id,
                    countHorizontal: Math.max(1 + direction.x, 1),
                    countVertical: Math.max(1 + direction.y, 1),
                };
                this.display.mergedCells.push(mergedCellExist);
            }
            // TODO optimize to not trigger too many updates
            for (var x = cellPos.x; x < cellPos.x + oldSize.x; ++x) {
                for (var y = cellPos.y; y < cellPos.y + oldSize.y; ++y) {
                    if (x !== cellPos.x || y !== cellPos.y) {
                        this.setDefaultCellAt(x, y);
                    }
                }
            }
            if (mergedCellExist.countVertical === 1 && mergedCellExist.countHorizontal === 1) {
                this.display.mergedCells.splice(this.display.mergedCells.indexOf(mergedCellExist), 1);
            }
            else {
                for (var x = cellPos.x; x < cellPos.x + mergedCellExist.countHorizontal; ++x) {
                    for (var y = cellPos.y; y < cellPos.y + mergedCellExist.countVertical; ++y) {
                        if (x !== cellPos.x || y !== cellPos.y) {
                            this.setCellBlankAt(x, y);
                        }
                    }
                }
            }
        };
        App.prototype.setCellBlankAt = function (x, y) {
            this.display.rows[y].cells[x].type = DisplayCellType.BLANK;
            this.display.rows[y].cells[x].data = {};
        };
        App.prototype.setDefaultCellAt = function (x, y) {
            this.display.rows[y].cells[x].type = DisplayCellType.URL;
            this.display.rows[y].cells[x].data = WidgetUrl_1.WidgetUrl.getDefaultData();
        };
        App.prototype.exportToFile = function () {
            var content = JSON.stringify(this.display);
            console.log(content);
            saveAs(new Blob([content]), 'dashboard.json');
        };
        App.prototype.importFromFile = function () {
            var _this = this;
            Utils_1.Utils.askFileContent().then(function (content) {
                try {
                    _this.updateDisplay(JSON.parse(content));
                }
                catch (e) { }
            }).catch();
        };
        App.prototype.saveDisplayLocally = function () {
            window.localStorage.setItem('config', JSON.stringify(this.display));
        };
        App.prototype.displayWatch = function () {
            this.saveDisplayLocally();
        };
        App.prototype.getDisplayLocally = function () {
            var content = window.localStorage.getItem('config');
            if (content)
                return JSON.parse(content);
            return this.getDefaultDisplay();
        };
        __decorate([
            VueAnnotate_1.VueVar()
        ], App.prototype, "display", void 0);
        __decorate([
            VueAnnotate_1.VueVar()
        ], App.prototype, "reloadCounterPerId", void 0);
        __decorate([
            VueAnnotate_1.VueVar()
        ], App.prototype, "optionsEnabled", void 0);
        __decorate([
            VueAnnotate_1.VueVar()
        ], App.prototype, "editedCell", void 0);
        __decorate([
            VueAnnotate_1.VueVar()
        ], App.prototype, "extensionIsInstalled", void 0);
        __decorate([
            VueAnnotate_1.VueWatched(true)
        ], App.prototype, "displayWatch", null);
        App = __decorate([
            VueAnnotate_1.VueClass(),
            VueAnnotate_1.VueRequireComponent('widgeturl', WidgetUrl_1.WidgetUrl),
            VueAnnotate_1.VueRequireComponent('widgettradingview', TradingviewWidget_1.TradingviewWidget)
        ], App);
        return App;
    }(Vue));
    var vue = new App('#app');
});
/*
function handleFKey(e : KeyboardEvent){
    //well you need keep on mind that your browser use some keys
    //to call some function, so we'll prevent this


    //now we caught the key code, yabadabadoo!!
    let keyCode = e.keyCode || e.which;
    //112 => F1
    //121 => F9
    console.log(keyCode);

    if(keyCode >= 112 && keyCode <= 121){
        e.preventDefault();
        vue.toggleOptions();
    }
}
$("body").on('keypress',handleFKey).on('keydown',handleFKey).on('keyup',handleFKey);
*/
//# sourceMappingURL=index.js.map