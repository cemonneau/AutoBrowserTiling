import {VueClass, VueComputed, VueRequireComponent, VueUpdated, VueVar, VueWatched} from "./libs/VueAnnotate/VueAnnotate";
import {Utils} from "./Utils";
import {Uuid} from "./Uuid";
import {DisplayCellUrl, WidgetUrl} from "./Widgets/WidgetUrl";
import {DisplayCellTradingview, TradingviewWidget} from "./Widgets/TradingviewWidget";

let extensionId = window.location.href.startsWith('http://localhost') ? 'omkoogckomimodfhcfkbpmflamheipfb' : 'mjoenlgcmnkonkmnjmlebkojpfcnkjfk';

function isExtensionInstalled() : Promise<boolean>{
	return new Promise<boolean>((resolve, reject)=>{
		chrome.runtime.sendMessage(extensionId, { message: "version" },
			function (reply : any) {
				if (reply) {
					if (reply.version) {
						resolve(true);
					}else
						resolve(false);
				}
				else {
					resolve(false);
				}
			});
	});
}


type DisplayCellOptions = {
	hideOverflow:boolean,
	reloadTimer:number,
	blackTimer:boolean
}


enum DisplayCellType{
	URL='URL',
	TRADINGVIEW='TRADINGVIEW',
	TWITTER='TWITTER',
}

type DisplayCell = {
	id:string,
	type:DisplayCellType,
	data:DisplayCellUrl|DisplayCellTradingview,
	options:DisplayCellOptions,
}

type DisplayRow = {
	cells:DisplayCell[],
}

type DisplayMergedCell = {
	primaryId:string,
	countHorizontal:number,
	countVertical:number,
}
type Display = {
	rows:DisplayRow[],
	mergedCells:DisplayMergedCell[]
}

@VueClass()
@VueRequireComponent('widgeturl', WidgetUrl)
@VueRequireComponent('widgettradingview', TradingviewWidget)
class App extends Vue{
	@VueVar() display : Display = {rows:[], mergedCells:[]};
	@VueVar() reloadCounterPerId : {[id : string] : number} = {};
	@VueVar() optionsEnabled : boolean = false;
	@VueVar() editedCell : DisplayCell|null = null;
	@VueVar() extensionIsInstalled : boolean = false;

	protected intervalReloadCounter : number = 0;

	constructor(container : string, vueConstructorParams ?: any) {
		super(vueConstructorParams);
		this.updateDisplay(this.getDisplayLocally());
		isExtensionInstalled().then((installed : boolean)=>{
			this.extensionIsInstalled = installed;
		});
	}

	protected getDefaultDisplay() : Display{
		return {
			rows:[
				{
					cells:[
						{id:Uuid.v4(),type:DisplayCellType.URL,data:{url:'https://google.fr'}, options:this.getDefaultCellOptions()},
					],
				},
			],
			mergedCells:[]
		};
	}

	protected getDefaultCellOptions() : DisplayCellOptions{
		return {
			reloadTimer:0,
			hideOverflow:true,
			blackTimer:false,
		}
	}

	protected ensureDisplayConsistency(display : Display){
		for(let row of display.rows){
			for(let cell of row.cells){
				if(typeof cell.type === 'undefined')cell.type = DisplayCellType.URL;
			}
		}
		return display;
	}

	updateDisplay(display : Display){
		this.display = this.ensureDisplayConsistency(display);
		this.updateCounters(true);
	}

	/*********************************************
	 * Iframe Reload system (functional & display)
	 *********************************************/
	updateCounters(recreateCounters : boolean = false){
		if(recreateCounters)
			this.reloadCounterPerId = {};

		for(let row of this.display.rows){
			for(let cell of row.cells){
				if(cell.options && cell.options.reloadTimer){
					let reloadCssAnimation = false;

					if(typeof this.reloadCounterPerId[cell.id] === 'undefined'){
						this.reloadCounterPerId[cell.id] = cell.options.reloadTimer;
						reloadCssAnimation = true;
					}else{
						this.reloadCounterPerId[cell.id]--;
						if(this.reloadCounterPerId[cell.id] <= 0) {
							this.reloadCounterPerId[cell.id] = cell.options.reloadTimer;
							let jiframe = $('div.cell[data-id='+cell.id+'] iframe');
							jiframe.attr('src',jiframe.attr('src'));
							reloadCssAnimation = true;
						}
					}
					if(reloadCssAnimation){
						this.resetCssAnimation($('div.cell[data-id='+cell.id+'] .countdown circle'));
					}
				}
			}
		}

		if(this.intervalReloadCounter === 0 || recreateCounters){
			if(this.intervalReloadCounter) clearInterval(this.intervalReloadCounter);
			this.intervalReloadCounter = setInterval(()=>{
				this.updateCounters();
			},1000);
		}

		this.$forceUpdate();
	}

	protected resetCssAnimation(jContainer : any){
		let val = jContainer.css('animation');
		jContainer.css('animation', 'none');
		setTimeout(()=>{
			jContainer.css('animation', val);
		},10);
	}

	/*********************************************
	 * Display functions for rows & cells
	 *********************************************/
	getOptionsForCell(cell : DisplayCell){
		return {...this.getDefaultCellOptions(),...cell.options};
	}

	getStyledOptionsForCell(cell : DisplayCell){
		let options = this.getOptionsForCell(cell);
		return {
			'overflow':options.hideOverflow ? 'hidden' : 'none',
		}
	}

	getRowHeightInPercent(row : DisplayRow) : number{
		return 100/this.display.rows.length;
	}
	getStyleForRow(row : DisplayRow){
		return {height:this.getRowHeightInPercent(row)+'%'};
	}

	getStyleForCell(row : DisplayRow, cell : DisplayCell){
		return {...{width:(100/row.cells.length)+'%'},...this.getStyledOptionsForCell(cell)};
	}

	/**
	 * If a cell is not visible due to another one overlapping it do not show it
	 * @param row
	 * @param cell
	 */
	isCellVisible(row : DisplayRow, cell : DisplayCell) : boolean{
		/*let cellPos = this.getCellPosition(row,cell);


		for(let mergedCellSearch of this.display.mergedCells){
			if(mergedCellSearch.primaryId === cell.id)
				return true;
		}*/
		return true;
	}

	getCellPosition(row : DisplayRow, cell : DisplayCell) : {x:number, y:number}{
		let y = 0, x = 0;
		for(let rowSearch of this.display.rows){
			if(rowSearch === row){
				for(let cellSearch of rowSearch.cells){
					if(cellSearch === cell){

						break;
					}
					++x;
				}
				break;
			}
			++y;
		}
		return {
			x:x,
			y:y,
		}
	}

	/*********************************************
	 * Options management
	 *********************************************/
	toggleOptions(){
		this.optionsEnabled = !this.optionsEnabled;
	}

	addRow(row : DisplayRow|null){
		let pos : number = -1;
		for(let i = 0; i < this.display.rows.length;++i){
			if(this.display.rows[i] === row){
				pos = i;
				break;
			}
		}
		if(row === null)
			pos = 0;

		if(pos !== -1){
			let newRow : DisplayRow = {
				cells:[],
			};
			this.display.rows.splice(pos+1, 0, newRow);
			this.updateCounters(true);//as it triggers HTML refresh
		}
	}
	removeRow(row : DisplayRow){
		for(let i = 0; i < this.display.rows.length;++i){
			if(this.display.rows[i] === row){
				this.display.rows.splice(i, 1);
				this.updateCounters(true);//as it triggers HTML refresh
				break;
			}
		}
	}
	addCell(row : DisplayRow, cell : DisplayCell|null){
		let pos = -1;
		for(let i = 0; i < row.cells.length;++i){
			if(row.cells[i] === cell){
				pos = i;
				break;
			}
		}
		if(row.cells.length === 0)
			pos = 0;
		if(pos !== -1){
			let newCell : DisplayCell = {
				id:''+Uuid.v4(),
				type:DisplayCellType.URL,
				data:{
					url:'https://google.com',
				},
				options:this.getDefaultCellOptions(),
			};
			row.cells.splice(pos+1, 0, newCell);
			this.updateCounters(true);//as it triggers HTML refresh
		}
	}
	editCell(cell : DisplayCell){
		this.editedCell = cell;
	}
	closeCellEditor(){
		this.editedCell = null;
		this.updateCounters(true);//as it triggers HTML refresh
	}
	editedCellTypeChanged(editedCell: DisplayCell){
		if(editedCell.type === DisplayCellType.URL)editedCell.data = WidgetUrl.getDefaultData();
		else if(editedCell.type === DisplayCellType.TRADINGVIEW) editedCell.data = TradingviewWidget.getDefaultData();
	}

	removeCell(row : DisplayRow,cell : DisplayCell){
		for(let i = 0; i < row.cells.length;++i){
			if(row.cells[i] === cell){
				row.cells.splice(i, 1);
				this.updateCounters(true);//as it triggers HTML refresh
				break;
			}
		}
	}

	exportToFile(){
		let content = JSON.stringify(this.display);
		console.log(content);
		saveAs(new Blob([content]), 'dashboard.json');
	}

	importFromFile(){
		Utils.askFileContent().then((content : string)=>{
			try{
				this.updateDisplay(JSON.parse(content));
			}catch (e) {}
		}).catch();
	}

	saveDisplayLocally(){
		window.localStorage.setItem('config', JSON.stringify(this.display));
	}
	@VueWatched(true)
	displayWatch(){
		this.saveDisplayLocally();
	}

	getDisplayLocally() : Display{
		let content = window.localStorage.getItem('config');
		if(content)
			return JSON.parse(content);
		return this.getDefaultDisplay();
	}

}

let vue = new App('#app');
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
