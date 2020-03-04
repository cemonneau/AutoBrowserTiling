define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var __extends2 = (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) {
                for (var p in b)
                    if (b.hasOwnProperty(p))
                        d[p] = b[p];
            };
        return function (d, b) {
            extendStatics(d, b);
            var __ = function () { this.constructor = d; };
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var vieObjectDictionary = {};
    function getDefaultMetadata() {
        return {
            watch: {},
            vars: {},
            computed: {},
            updated: null,
            mounted: null,
            destroyed: null,
            beforeDestroy: null,
            beforeUpdate: null,
            props: [],
        };
    }
    function initObjectDictionary(constructor) {
        if (typeof vieObjectDictionary[constructor] === 'undefined') {
            vieObjectDictionary[constructor] = getDefaultMetadata();
        }
    }
    function loopToFindChildClass(mother) {
        if (mother && mother.__proto__ && mother.__proto__ !== Object.__proto__) {
            // console.log('subclass', typeof vieObjectDictionary[mother.__proto__] !== 'undefined', mother.__proto__ === Object.__proto__, mother.__proto__);
            // console.log('subclass constructor', mother.__proto__.constructor);
            var arr = loopToFindChildClass(mother.__proto__);
            arr.push(mother.__proto__);
            return arr;
        }
        return [];
    }
    function mergeMetaData(metadatas) {
        var finalMeta = {
            watch: {},
            vars: {},
            computed: {},
            updated: null,
            mounted: null,
            destroyed: null,
            beforeDestroy: null,
            beforeUpdate: null,
            props: [],
        };
        for (var _i = 0, metadatas_1 = metadatas; _i < metadatas_1.length; _i++) {
            var metadata = metadatas_1[_i];
            finalMeta.props.push.apply(finalMeta.props, metadata.props);
            for (var i in metadata.watch)
                finalMeta.watch[i] = metadata.watch[i];
            for (var i in metadata.vars)
                finalMeta.vars[i] = metadata.vars[i];
            for (var i in metadata.computed)
                finalMeta.computed[i] = metadata.computed[i];
            if (!finalMeta.updated && metadata.updated)
                finalMeta.updated = metadata.updated;
            if (!finalMeta.mounted && metadata.mounted)
                finalMeta.mounted = metadata.mounted;
        }
        return finalMeta;
    }
    function VueClass() {
        return function (target) {
            var instance = /** @class */ (function (_super) {
                __extends2(class_1, _super);
                function class_1() {
                    var args = Array.prototype.slice.call(arguments);
                    var initParams = { data: {} };
                    if (args.length >= 1 && typeof args[0] == 'string') {
                        initParams = {
                            // el:args[0],
                            data: {},
                            watch: {},
                            computed: {},
                            updated: undefined,
                            methods: {}
                        };
                        var metadatas = [];
                        if (vieObjectDictionary[_super])
                            metadatas.push(vieObjectDictionary[_super]);
                        var allClasses = loopToFindChildClass(_super);
                        for (var _i = 0, allClasses_1 = allClasses; _i < allClasses_1.length; _i++) {
                            var classpath = allClasses_1[_i];
                            if (vieObjectDictionary[classpath])
                                metadatas.push(vieObjectDictionary[classpath]);
                        }
                        var metadata = mergeMetaData(metadatas);
                        // let metadata : VueMetaData = this.constructor['metadata'];
                        if (metadata) {
                            for (var varName in metadata.vars) {
                                this[varName] = metadata.vars[varName];
                                initParams.data[varName] = metadata.vars[varName];
                            }
                            for (var varName in metadata.watch) {
                                var descriptor = metadata.watch[varName];
                                if (descriptor.deep)
                                    initParams.watch[varName] = {
                                        handler: this[descriptor.funcName],
                                        deep: true
                                    };
                                else
                                    initParams.watch[varName] = this[descriptor.funcName];
                            }
                            for (var index in metadata.computed) {
                                var descriptor = metadata.computed[index];
                                if (typeof initParams.computed[descriptor.bindOn] === 'undefined')
                                    initParams.computed[descriptor.bindOn] = {};
                                initParams.computed[descriptor.bindOn][descriptor.action] = this[descriptor.name];
                            }
                            if (metadata.updated !== null) {
                                initParams.updated = this[metadata.updated];
                            }
                            if (metadata.mounted !== null) {
                                initParams.mounted = this[metadata.mounted];
                            }
                        }
                        /*for(let functionName in _super){
                            if(
                                typeof _super[functionName] === 'function' &&
                                functionName[0] !== '$' && functionName[0] !== '_'
                            )
                                initParams.methods[functionName] = _super[functionName];
                        }
                        /*for(let functionName in _super.prototype){
                            if(functionName !== 'constructor')
                                initParams.methods[functionName] = _super.prototype[functionName];
                        }*/
                        args.push(initParams);
                    }
                    var _this = _super !== null && _super.apply(this, args) || this;
                    // for (let varName in initParams.data) {
                    // 	if(initParams.data[varName] && !(<any>_this)[varName])
                    // 		(<any>_this)[varName] = initParams.data[varName];
                    // }
                    _this.$mount(args[0]);
                    return _this;
                }
                return class_1;
            }(target));
            // console.log('instance:', instance);
            return instance;
        };
    }
    exports.VueClass = VueClass;
    function VueWatched(listenedPropertyOrDeep, deep) {
        if (listenedPropertyOrDeep === void 0) { listenedPropertyOrDeep = ''; }
        if (deep === void 0) { deep = false; }
        return function (target, propertyKey, descriptor) {
            var listenedProperty = '';
            if (listenedPropertyOrDeep === true) {
                deep = true;
                listenedPropertyOrDeep = null;
            }
            else if (listenedPropertyOrDeep === false) {
                deep = false;
                listenedPropertyOrDeep = null;
            }
            else if (listenedPropertyOrDeep === null) {
                listenedPropertyOrDeep = '';
            }
            else {
                listenedProperty = listenedPropertyOrDeep;
            }
            if (listenedProperty === '') {
                var wordsResearch = ['Watch'];
                for (var _i = 0, wordsResearch_1 = wordsResearch; _i < wordsResearch_1.length; _i++) {
                    var wordResearch = wordsResearch_1[_i];
                    if (propertyKey.indexOf(wordResearch) === propertyKey.length - wordResearch.length) {
                        listenedProperty = propertyKey.substr(0, propertyKey.length - wordResearch.length);
                        break;
                    }
                }
            }
            initObjectDictionary(target.constructor);
            vieObjectDictionary[target.constructor].watch[listenedProperty] = { funcName: propertyKey, deep: deep };
            if (typeof target.constructor['metadata'] === 'undefined')
                target.constructor['metadata'] = getDefaultMetadata();
            target.constructor['metadata'].watch[listenedProperty] = { funcName: propertyKey, deep: deep };
        };
    }
    exports.VueWatched = VueWatched;
    function VueVar(defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        return function PropertyDecorator(target, propertyKey) {
            initObjectDictionary(target.constructor);
            vieObjectDictionary[target.constructor].vars[propertyKey] = defaultValue;
            if (typeof target.constructor['metadata'] === 'undefined')
                target.constructor['metadata'] = getDefaultMetadata();
            target.constructor['metadata'].vars[propertyKey] = defaultValue;
        };
    }
    exports.VueVar = VueVar;
    function VueParam() {
        return function PropertyDecorator(target, propertyKey) {
            initObjectDictionary(target.constructor);
            if (vieObjectDictionary[target.constructor].props.indexOf(propertyKey) === -1)
                vieObjectDictionary[target.constructor].props.push(propertyKey);
            if (typeof target.constructor['metadata'] === 'undefined')
                target.constructor['metadata'] = getDefaultMetadata();
            if (target.constructor['metadata'].props.indexOf(propertyKey) === -1)
                target.constructor['metadata'].props.push(propertyKey);
        };
    }
    exports.VueParam = VueParam;
    function VueMounted() {
        return function PropertyDecorator(target, propertyKey) {
            initObjectDictionary(target.constructor);
            vieObjectDictionary[target.constructor].mounted = propertyKey;
            if (typeof target.constructor['metadata'] === 'undefined')
                target.constructor['metadata'] = getDefaultMetadata();
            target.constructor['metadata'].mounted = propertyKey;
        };
    }
    exports.VueMounted = VueMounted;
    function VueUpdated() {
        return function PropertyDecorator(target, propertyKey) {
            initObjectDictionary(target.constructor);
            vieObjectDictionary[target.constructor].updated = propertyKey;
            if (typeof target.constructor['metadata'] === 'undefined')
                target.constructor['metadata'] = getDefaultMetadata();
            target.constructor['metadata'].updated = propertyKey;
        };
    }
    exports.VueUpdated = VueUpdated;
    function VueBeforeUpdated() {
        return function PropertyDecorator(target, propertyKey) {
            initObjectDictionary(target.constructor);
            vieObjectDictionary[target.constructor].beforeUpdate = propertyKey;
            if (typeof target.constructor['metadata'] === 'undefined')
                target.constructor['metadata'] = getDefaultMetadata();
            target.constructor['metadata'].beforeUpdate = propertyKey;
        };
    }
    exports.VueBeforeUpdated = VueBeforeUpdated;
    function VueBeforeDestroy() {
        return function PropertyDecorator(target, propertyKey) {
            initObjectDictionary(target.constructor);
            vieObjectDictionary[target.constructor].beforeDestroy = propertyKey;
            if (typeof target.constructor['metadata'] === 'undefined')
                target.constructor['metadata'] = getDefaultMetadata();
            target.constructor['metadata'].beforeDestroy = propertyKey;
        };
    }
    exports.VueBeforeDestroy = VueBeforeDestroy;
    function VueDestroyed() {
        return function PropertyDecorator(target, propertyKey) {
            initObjectDictionary(target.constructor);
            vieObjectDictionary[target.constructor].destroyed = propertyKey;
            if (typeof target.constructor['metadata'] === 'undefined')
                target.constructor['metadata'] = getDefaultMetadata();
            target.constructor['metadata'].destroyed = propertyKey;
        };
    }
    exports.VueDestroyed = VueDestroyed;
    function VueComputed(varName, action) {
        if (varName === void 0) { varName = ''; }
        if (action === void 0) { action = ''; }
        return function PropertyDecorator(target, propertyKey) {
            if (varName == '' && action == '') {
                if (propertyKey.indexOf('get') == 0) {
                    action = 'get';
                    varName = propertyKey.charAt(3).toLowerCase() + propertyKey.substr(4);
                }
                else if (propertyKey.indexOf('set') == 0) {
                    action = 'set';
                    varName = propertyKey.charAt(3).toLowerCase() + propertyKey.substr(4);
                }
            }
            else if (action == '') {
                action = 'get';
            }
            if (varName == '') {
                varName = propertyKey;
            }
            initObjectDictionary(target.constructor);
            vieObjectDictionary[target.constructor].computed[action + varName] = { bindOn: varName, name: propertyKey, action: action };
            if (typeof target.constructor['metadata'] === 'undefined')
                target.constructor['metadata'] = getDefaultMetadata();
            target.constructor['metadata'].computed[action + varName] = { bindOn: varName, name: propertyKey, action: action };
        };
    }
    exports.VueComputed = VueComputed;
    var allRegisteredVueComponents = {};
    function VueRequireComponent(componentName, componentClass) {
        return function (target) {
            if (typeof allRegisteredVueComponents[componentName] === 'undefined') {
                if (typeof componentClass.template === 'undefined') {
                    console.error('Component being registered as ' + componentName + ' is missing his template');
                    return;
                }
                var metadata_1 = vieObjectDictionary[componentClass];
                metadata_1 = vieObjectDictionary[componentClass];
                var methods = {};
                //seems to not work, still requires to add "()" in the html code to call the function
                for (var functionName in componentClass.prototype) {
                    if (functionName !== 'constructor')
                        methods[functionName] = componentClass.prototype[functionName];
                }
                var data = function () {
                    window._vueAnnotateComponentContainer = this;
                    var newThis = new componentClass(this);
                    delete window._vueAnnotateComponentContainer;
                    var objectPropertyNames = Object.getOwnPropertyNames(newThis.__proto__);
                    for (var _i = 0, objectPropertyNames_1 = objectPropertyNames; _i < objectPropertyNames_1.length; _i++) {
                        var objectPropertyName = objectPropertyNames_1[_i];
                        var property = Object.getOwnPropertyDescriptor(newThis.__proto__, objectPropertyName);
                        if (property)
                            Object.defineProperty(this, objectPropertyName, property);
                    }
                    for (var iVar in metadata_1.vars) {
                        if (typeof newThis[iVar] === 'undefined') {
                            if (typeof metadata_1.vars[iVar] !== 'undefined')
                                newThis[iVar] = metadata_1.vars[iVar];
                            else {
                                console.warn('Variable ' + iVar + ' in component ' + componentName + ' is missing a default value');
                            }
                        }
                    }
                    return newThis;
                };
                var watch = {};
                for (var varName in metadata_1.watch) {
                    var descriptor = metadata_1.watch[varName];
                    if (descriptor.deep)
                        watch[varName] = {
                            handler: componentClass.prototype[descriptor.funcName],
                            deep: true
                        };
                    else
                        watch[varName] = componentClass.prototype[descriptor.funcName];
                }
                var mounted = metadata_1.mounted && typeof componentClass.prototype[metadata_1.mounted] === 'function' ? componentClass.prototype[metadata_1.mounted] : undefined;
                var updated = metadata_1.updated && typeof componentClass.prototype[metadata_1.updated] === 'function' ? componentClass.prototype[metadata_1.updated] : undefined;
                var destroyed = metadata_1.destroyed && typeof componentClass.prototype[metadata_1.destroyed] === 'function' ? componentClass.prototype[metadata_1.destroyed] : undefined;
                var beforeDestroy = metadata_1.beforeDestroy && typeof componentClass.prototype[metadata_1.beforeDestroy] === 'function' ? componentClass.prototype[metadata_1.beforeDestroy] : undefined;
                var beforeUpdate = metadata_1.beforeUpdate && typeof componentClass.prototype[metadata_1.beforeUpdate] === 'function' ? componentClass.prototype[metadata_1.beforeUpdate] : undefined;
                var componentDescriptor = {
                    template: componentClass.template,
                    props: metadata_1.props,
                    data: data,
                    computed: metadata_1.computed,
                    watch: watch,
                    methods: methods,
                    updated: updated,
                    mounted: mounted,
                    destroyed: destroyed,
                    beforeDestroy: beforeDestroy,
                    beforeUpdate: beforeUpdate,
                };
                Vue.component(componentName, componentDescriptor);
                allRegisteredVueComponents[componentName] = componentDescriptor;
            }
            else {
            }
            return target;
        };
    }
    exports.VueRequireComponent = VueRequireComponent;
    var allRegisteredVueFilter = {};
    function VueRequireFilter(filterName, callback) {
        return function (target) {
            if (typeof allRegisteredVueFilter[filterName] !== 'undefined' &&
                allRegisteredVueFilter[filterName] === callback) {
                console.warn('Already binded Vue Filter on ' + filterName);
            }
            else {
                Vue.filter(filterName, callback);
                allRegisteredVueFilter[filterName] = callback;
            }
            return target;
        };
    }
    exports.VueRequireFilter = VueRequireFilter;
    var VueVirtualComponent = /** @class */ (function () {
        function VueVirtualComponent(proxy) {
            var _this_1 = this;
            this.$set = function (target, propertyNameOrIndex, value) {
                return _this_1.componentProxy.$set(target, propertyNameOrIndex, value);
            };
            this.$delete = function (target, propertyNameOrIndex) {
                return _this_1.componentProxy.$delete(target, propertyNameOrIndex);
            };
            /**
             * Send a signal back to the parent
             * On the parent bind it with v-on:signal-name="functionToCall()"
             * When sending a signal with args, use v-on:signal-name="functionToCall(...arguments)" to get them as parameters. It's possible to put other parameters before those injected
             * with v-on:signal-name="functionToCall("a string", 0, ...arguments)"
             * @param event
             * @param args
             */
            this.$emit = function (event) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                _this_1.componentProxy.$emit.apply(_this_1.componentProxy, [event].concat(args));
            };
            /**
             * Execute something at the "next tick" which will execute AFTER vuejs DOM updates
             * @param callback
             */
            this.$nextTick = function (callback) {
                return _this_1.componentProxy.$nextTick(callback);
            };
            /**
             * Force a synchronous DOM refresh
             */
            this.$forceUpdate = function () {
                return _this_1.componentProxy.$forceUpdate();
            };
            /**
             * Delete the current view (vuejs representation)
             */
            this.$destroy = function () {
                return _this_1.componentProxy.$destroy();
            };
            this.componentProxy = typeof proxy !== 'undefined' ? proxy : window._vueAnnotateComponentContainer;
        }
        return VueVirtualComponent;
    }());
    exports.VueVirtualComponent = VueVirtualComponent;
});
//# sourceMappingURL=VueAnnotate.js.map