let __extends2 = (function () {
	let extendStatics = Object.setPrototypeOf ||
		({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
		function (d:any, b:any)
		{
			for (let p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
		};
	return function (d:any, b:any) {
		extendStatics(d, b);
		let __ : any = function(this:any) { this.constructor = d; };
		d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
})();

let vieObjectDictionary : {[constructorPrototype : string] : VueMetaData}= {};
function getDefaultMetadata(){
	return {
		watch:{},
		vars:{},
		computed:{},
		updated:null,
		mounted:null,
		destroyed:null,
		beforeDestroy:null,
		beforeUpdate:null,
		props:[],
	};
}
function initObjectDictionary(constructor : string){
	if(typeof vieObjectDictionary[constructor] === 'undefined'){
		vieObjectDictionary[constructor] = getDefaultMetadata();
	}
}

function loopToFindChildClass(mother : any) : any[]{
	if(mother && mother.__proto__ && mother.__proto__ !== (<any>Object).__proto__){
		// console.log('subclass', typeof vieObjectDictionary[mother.__proto__] !== 'undefined', mother.__proto__ === Object.__proto__, mother.__proto__);
		// console.log('subclass constructor', mother.__proto__.constructor);
		let arr = loopToFindChildClass(mother.__proto__);
		arr.push(mother.__proto__);
		return arr;
	}
	return [];
}

function mergeMetaData(metadatas : VueMetaData[]) : VueMetaData{
	let finalMeta : VueMetaData = {
		watch:{},
		vars:{},
		computed:{},
		updated:null,
		mounted:null,
		destroyed:null,
		beforeDestroy:null,
		beforeUpdate:null,
		props:[],
	};
	for(let metadata of metadatas){
		finalMeta.props.push.apply(finalMeta.props, metadata.props);
		for(let i in metadata.watch)finalMeta.watch[i] = metadata.watch[i];
		for(let i in metadata.vars)finalMeta.vars[i] = metadata.vars[i];
		for(let i in metadata.computed)finalMeta.computed[i] = metadata.computed[i];
		if(!finalMeta.updated && metadata.updated)finalMeta.updated = metadata.updated;
		if(!finalMeta.mounted && metadata.mounted)finalMeta.mounted = metadata.mounted;
	}

	return finalMeta;
}

export function VueClass() {
	return function(target: any) : any {
		let instance = /** @class */ (function (_super) {
			__extends2(class_1, _super);
			function class_1(this:any) {
				let args = Array.prototype.slice.call(arguments);

				let initParams : VueConstructObject = {data:{}};
				if(args.length >= 1 && typeof args[0] == 'string') {
					initParams = {
						// el:args[0],
						data: {},
						watch: {},
						computed: {},
						updated: undefined,
						methods:{}
					};

					let metadatas : VueMetaData[] = [];
					if(vieObjectDictionary[_super])
						metadatas.push(vieObjectDictionary[_super]);

					let allClasses = loopToFindChildClass(_super);
					for(let classpath of allClasses){
						if(vieObjectDictionary[classpath])
							metadatas.push(vieObjectDictionary[classpath]);
					}

					let metadata : VueMetaData = mergeMetaData(metadatas);
					// let metadata : VueMetaData = this.constructor['metadata'];

					if (metadata) {
						for (let varName in metadata.vars) {
							(<any>this)[varName] = metadata.vars[varName];
							initParams.data[varName] = metadata.vars[varName];
						}
						for (let varName in metadata.watch) {
							let descriptor: { funcName: string, deep: boolean } = metadata.watch[varName];
							if (descriptor.deep)
								initParams.watch[varName] = {
									handler: this[descriptor.funcName],
									deep: true
								};
							else
								initParams.watch[varName] = this[descriptor.funcName];
						}
						for (let index in metadata.computed) {
							let descriptor: { bindOn: string, action: string, name: string } = metadata.computed[index];
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
				let _this : Vue = _super !== null && _super.apply(this, args) || this;

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
	}
}

export function VueWatched(listenedPropertyOrDeep:string|null|boolean='', deep:boolean=false) {
	return function (target : any, propertyKey: string, descriptor: PropertyDescriptor) {
		let listenedProperty : string = '';
		if(listenedPropertyOrDeep === true){
			deep = true;
			listenedPropertyOrDeep = null;
		}else if(listenedPropertyOrDeep === false){
			deep = false;
			listenedPropertyOrDeep = null;
		}else if(listenedPropertyOrDeep === null){
			listenedPropertyOrDeep = '';
		}else{
			listenedProperty = listenedPropertyOrDeep;
		}

		if(listenedProperty === ''){
			let wordsResearch = ['Watch'];
			for(let wordResearch of wordsResearch) {
				if (propertyKey.indexOf(wordResearch) === propertyKey.length - wordResearch.length) {
					listenedProperty = propertyKey.substr(0, propertyKey.length - wordResearch.length);
					break;
				}
			}
		}
		initObjectDictionary(target.constructor);
		vieObjectDictionary[target.constructor].watch[listenedProperty] = {funcName:propertyKey, deep:deep};

		if(typeof target.constructor['metadata'] === 'undefined')target.constructor['metadata'] = getDefaultMetadata();
		target.constructor['metadata'].watch[listenedProperty] = {funcName:propertyKey, deep:deep};
	}
}

export function VueVar(defaultValue:any=null) {
	return function PropertyDecorator(target: Object|any,propertyKey: string | symbol) {
		initObjectDictionary(target.constructor);
		vieObjectDictionary[target.constructor].vars[propertyKey] = defaultValue;

		if(typeof target.constructor['metadata'] === 'undefined')target.constructor['metadata'] = getDefaultMetadata();
		target.constructor['metadata'].vars[propertyKey] = defaultValue;
	}
}

export function VueParam() {
	return function PropertyDecorator(target: Object|any,propertyKey: string) {
		initObjectDictionary(target.constructor);
		if(vieObjectDictionary[target.constructor].props.indexOf(propertyKey) === -1)
			vieObjectDictionary[target.constructor].props.push(propertyKey);

		if(typeof target.constructor['metadata'] === 'undefined')target.constructor['metadata'] = getDefaultMetadata();
		if(target.constructor['metadata'].props.indexOf(propertyKey) === -1)
			target.constructor['metadata'].props.push(propertyKey);
	}
}

export function VueMounted(){
	return function PropertyDecorator(target: Object|any,propertyKey: string | symbol) {
		initObjectDictionary(target.constructor);
		vieObjectDictionary[target.constructor].mounted = propertyKey;

		if(typeof target.constructor['metadata'] === 'undefined')target.constructor['metadata'] = getDefaultMetadata();
		target.constructor['metadata'].mounted = propertyKey;
	}
}

export function VueUpdated() {
	return function PropertyDecorator(target: Object|any,propertyKey: string | symbol) {
		initObjectDictionary(target.constructor);
		vieObjectDictionary[target.constructor].updated = propertyKey;

		if(typeof target.constructor['metadata'] === 'undefined')target.constructor['metadata'] = getDefaultMetadata();
		target.constructor['metadata'].updated = propertyKey;
	}
}

export function VueBeforeUpdated() {
	return function PropertyDecorator(target: Object|any,propertyKey: string | symbol) {
		initObjectDictionary(target.constructor);
		vieObjectDictionary[target.constructor].beforeUpdate = propertyKey;

		if(typeof target.constructor['metadata'] === 'undefined')target.constructor['metadata'] = getDefaultMetadata();
		target.constructor['metadata'].beforeUpdate = propertyKey;
	}
}

export function VueBeforeDestroy() {
	return function PropertyDecorator(target: Object|any,propertyKey: string | symbol) {
		initObjectDictionary(target.constructor);
		vieObjectDictionary[target.constructor].beforeDestroy = propertyKey;

		if(typeof target.constructor['metadata'] === 'undefined')target.constructor['metadata'] = getDefaultMetadata();
		target.constructor['metadata'].beforeDestroy = propertyKey;
	}
}

export function VueDestroyed() {
	return function PropertyDecorator(target: Object|any,propertyKey: string | symbol) {
		initObjectDictionary(target.constructor);
		vieObjectDictionary[target.constructor].destroyed = propertyKey;

		if(typeof target.constructor['metadata'] === 'undefined')target.constructor['metadata'] = getDefaultMetadata();
		target.constructor['metadata'].destroyed = propertyKey;
	}
}

export function VueComputed(varName:string='', action:'get'|'set'|''='') {
	return function PropertyDecorator(target: Object|any,propertyKey: string) {
		if(varName == '' && action == ''){
			if(propertyKey.indexOf('get') == 0){
				action = 'get';
				varName = propertyKey.charAt(3).toLowerCase()+propertyKey.substr(4);
			}else if(propertyKey.indexOf('set') == 0){
				action = 'set';
				varName = propertyKey.charAt(3).toLowerCase()+propertyKey.substr(4);
			}
		}else if(action == ''){
			action = 'get';
		}

		if(varName == ''){
			varName = propertyKey;
		}

		initObjectDictionary(target.constructor);
		vieObjectDictionary[target.constructor].computed[action+varName] = {bindOn:varName,name:propertyKey, action:action};

		if(typeof target.constructor['metadata'] === 'undefined')target.constructor['metadata'] = getDefaultMetadata();
		target.constructor['metadata'].computed[action+varName] = {bindOn:varName,name:propertyKey, action:action};
	}
}

let allRegisteredVueComponents : any = {};
export function VueRequireComponent(componentName : string, componentClass : { new (...keys:any[]): any, template ?:string }) {
	return function(target: any) : any {
		if(typeof allRegisteredVueComponents[componentName] === 'undefined') {
			if(typeof componentClass.template === 'undefined'){
				console.error('Component being registered as '+componentName+' is missing his template');
				return;
			}

			let metadata: VueMetaData = vieObjectDictionary[<any>componentClass];
			metadata = vieObjectDictionary[<any>componentClass];

			let methods : any = {};
			//seems to not work, still requires to add "()" in the html code to call the function
			for(let functionName in componentClass.prototype){
				if(functionName !== 'constructor')
					methods[functionName] = componentClass.prototype[functionName];
			}

			let data = function (this: any) {
				(<any>window)._vueAnnotateComponentContainer = this;
				let newThis = new componentClass(this);
				delete (<any>window)._vueAnnotateComponentContainer;

				let objectPropertyNames = Object.getOwnPropertyNames(newThis.__proto__);
				for(let objectPropertyName of objectPropertyNames){
					let property = Object.getOwnPropertyDescriptor(newThis.__proto__, objectPropertyName);
					if(property)
						Object.defineProperty(this, objectPropertyName, property);
				}
				for (let iVar in metadata.vars) {
					if(typeof newThis[iVar] === 'undefined') {
						if (typeof metadata.vars[iVar] !== 'undefined')
							newThis[iVar] = metadata.vars[iVar];
						else{
							console.warn('Variable '+iVar+' in component '+componentName+' is missing a default value');
						}
					}
				}

				return newThis;
			};

			let watch : any = {};
			for (let varName in metadata.watch) {
				let descriptor = metadata.watch[varName];
				if (descriptor.deep)
					watch[varName] = {
						handler: componentClass.prototype[descriptor.funcName],
						deep: true
					};
				else
					watch[varName] = componentClass.prototype[descriptor.funcName];
			}
			let mounted = metadata.mounted && typeof componentClass.prototype[metadata.mounted] === 'function' ? componentClass.prototype[metadata.mounted] : undefined;
			let updated = metadata.updated && typeof componentClass.prototype[metadata.updated] === 'function' ? componentClass.prototype[metadata.updated] : undefined;
			let destroyed = metadata.destroyed && typeof componentClass.prototype[metadata.destroyed] === 'function' ? componentClass.prototype[metadata.destroyed] : undefined;
			let beforeDestroy = metadata.beforeDestroy && typeof componentClass.prototype[metadata.beforeDestroy] === 'function' ? componentClass.prototype[metadata.beforeDestroy] : undefined;
			let beforeUpdate = metadata.beforeUpdate && typeof componentClass.prototype[metadata.beforeUpdate] === 'function' ? componentClass.prototype[metadata.beforeUpdate] : undefined;

			let componentDescriptor: VueComponentObject = {
				template: componentClass.template,
				props: metadata.props,
				data: data,
				computed: metadata.computed,
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
		}else{
		}

		return target;
	}
}


let allRegisteredVueFilter : any = {};

export function VueRequireFilter(filterName : string, callback : Function){
	return function(target: any) : any {
		if(
			typeof allRegisteredVueFilter[filterName] !== 'undefined' &&
			allRegisteredVueFilter[filterName] === callback
		){
			console.warn('Already binded Vue Filter on '+filterName);
		}else {
			Vue.filter(filterName, callback);
			allRegisteredVueFilter[filterName] = callback;
		}
		return target;
	}
}

export abstract class VueVirtualComponent{
	private componentProxy : VueVirtualComponent;

	constructor(proxy ?: VueVirtualComponent|undefined){
		this.componentProxy = typeof proxy !== 'undefined' ? proxy : (<any>window)._vueAnnotateComponentContainer;
	}

	public $set : (target : Object|Array<any>, propertyNameOrIndex : string|number, value : any)=>void =
		(target : Object|Array<any>, propertyNameOrIndex : string|number, value : any)=> {
			return this.componentProxy.$set(target, propertyNameOrIndex, value);
		};

	public $delete : (target : Object|Array<any>, propertyNameOrIndex : string|number)=>void =
		(target : Object|Array<any>, propertyNameOrIndex : string|number)=> {
			return this.componentProxy.$delete(target, propertyNameOrIndex);
		};

	/**
	 * Send a signal back to the parent
	 * On the parent bind it with v-on:signal-name="functionToCall()"
	 * When sending a signal with args, use v-on:signal-name="functionToCall(...arguments)" to get them as parameters. It's possible to put other parameters before those injected
	 * with v-on:signal-name="functionToCall("a string", 0, ...arguments)"
	 * @param event
	 * @param args
	 */
	public $emit : (event : string, ...args: any[])=>void =
		(event : string, ...args: any[])=> {
			this.componentProxy.$emit.apply(this.componentProxy, (<any>[event].concat(args)));
		};

	/**
	 * Execute something at the "next tick" which will execute AFTER vuejs DOM updates
	 * @param callback
	 */
	public $nextTick : (callback : Function) => void =
		(callback : Function)=> {
			return this.componentProxy.$nextTick(callback);
		};

	/**
	 * Force a synchronous DOM refresh
	 */
	public $forceUpdate : () => void =
		()=> {
			return this.componentProxy.$forceUpdate();
		};

	/**
	 * Delete the current view (vuejs representation)
	 */
	public $destroy : () => void =
		()=> {
			return this.componentProxy.$destroy();
		};
}