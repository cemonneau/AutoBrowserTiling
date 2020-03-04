import {VueParam, VueVirtualComponent} from "../libs/VueAnnotate/VueAnnotate";

export type DisplayCellUrl = {
	url:string,
}

export class WidgetUrl extends VueVirtualComponent{
	@VueParam() componentData !: DisplayCellUrl;
	@VueParam() cellOptions : any;

	static getDefaultData() : DisplayCellUrl{
		return {
			url:'https://google.fr'
		};
	}

	static template = `<div style="width:100%;height:100%;">
			<iframe v-if="componentData.url && componentData.url.length > 0" :src="componentData.url" :scrolling="cellOptions.hideOverflow ? 'no' : 'auto'"></iframe>
		</div>`;
}