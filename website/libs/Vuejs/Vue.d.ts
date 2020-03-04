type VueMetaData = {
	watch:any,
	vars:any,
	computed:{[action : string] : { bindOn: string, action: string, name: string }},
	updated:any,
	mounted:any,
	destroyed:any,
	beforeDestroy:any,
	beforeUpdate:any,
	props:string[]
};

type VueConstructObject = {el?:string,data:any, watch?:any, computed?:any, updated?:any, mounted?:any, methods?:any};
type VueComponentObject = {
	template:string,
	props?:Array<string>,
	data?:Function,
	watch?:any,
	computed:any,
	methods?:{[funcName : string] : CallableFunction},
	updated?:any,
	mounted?:any,
	destroyed?:any,
	beforeDestroy?:any,
	beforeUpdate?:any,
}

// declare var Vue : any;
declare class Vue{
	constructor(any : VueConstructObject|string|null);

	$nextTick(callback : Function) : void;
	$forceUpdate() : void;
	$refs : {[key : string] : any};
	$mount(el : string) : void;
	$delete() : void;

	static component(componentName : string, data : VueComponentObject|any) : void;
	static filter(name : string, callback : Function) : void;

	static options : {
		components:any,
		filters:any
	};
}
