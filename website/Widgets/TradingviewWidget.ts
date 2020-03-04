import {VueMounted, VueParam, VueVar, VueVirtualComponent} from "../libs/VueAnnotate/VueAnnotate";
import {Uuid} from "../Uuid";
import {Promises} from "../utils/Promises";

export type DisplayCellTradingview = {
	light:boolean,
	defaultInterval:'1'|'3'|'5'|'15'|'30'|'60'|'120'|'240'|'D'|'W'|'M',
	hideTopToolbar:boolean,
	hideLegend:boolean,
	saveImage:boolean,
	symbol:string,
	allowSymbolChange:boolean,
	hideSideToolbar:boolean,
	enablePublishing:boolean,
}

export class TradingviewWidget extends VueVirtualComponent{
	@VueParam() componentData !: DisplayCellTradingview;
	@VueParam() cellOptions : any;

	@VueVar() containerId : string;

	protected widget : any = null;

	constructor() {
		super();
		this.containerId = Uuid.v4();
	}

	@VueMounted()
	mounted(){
		try {
			TradingviewWidget.loadTradingviewApi().then(()=>{
				this.widget = new (<any>window).TradingView.widget(
					{
						autosize:true,
						symbol: this.componentData.symbol,
						interval: this.componentData.defaultInterval,
						timezone: "Etc/UTC",
						theme: this.componentData.light ? 'Light' : 'Dark',
						"style": "1",
						"locale": "en",
						"toolbar_bg": "#f1f3f6",
						enable_publishing: this.componentData.enablePublishing,
						hide_top_toolbar: this.componentData.hideTopToolbar,
						hide_legend: this.componentData.hideLegend,
						save_image: this.componentData.saveImage,
						container_id: this.containerId,
						allow_symbol_change: this.componentData.allowSymbolChange,
						hide_side_toolbar: this.componentData.hideSideToolbar,
						// "referral_id": "fdsfdsf",
					}
				);
				console.log(this.widget);
				(<any>window).widget = this.widget;

				// this.widget.getSymbolInfo(console.log);
			}).catch((e)=>console.error(e));
		}catch (e) {
			console.error(e);
		}
	}

	static template = `<div style="width:100%;height:100%;" :id="containerId"></div>`;


	static getDefaultData() : DisplayCellTradingview{
		return {
			symbol:'NASDAQ:AAPL',
			saveImage:false,
			hideLegend:false,
			hideTopToolbar:false,
			light:false,
			defaultInterval:'60',
			hideSideToolbar:false,
			allowSymbolChange:false,
			enablePublishing:false,
		};
	}

	protected static tradingviewLoaded : boolean = false;
	protected static tradingviewLoading : null|Promise<void> = null;
	protected static loadTradingviewApi() : Promise<void>{
		if(TradingviewWidget.tradingviewLoaded)
			return Promise.resolve();
		else if(TradingviewWidget.tradingviewLoading)
			return TradingviewWidget.tradingviewLoading;

		TradingviewWidget.tradingviewLoading = new Promise<void>((resolve, reject)=>{
			(function(d, script : any = undefined) {
				script = d.createElement('script');
				script.type = 'text/javascript';
				script.async = true;
				script.onload = function(){
					TradingviewWidget.tradingviewLoaded = true;
					resolve();
				};
				script.src = 'https://s3.tradingview.com/tv.js';
				d.getElementsByTagName('head')[0].appendChild(script);
			}(document));
		});

		return TradingviewWidget.tradingviewLoading;
	}
}