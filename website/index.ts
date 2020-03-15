import {VueClass, VueComputed, VueRequireComponent, VueUpdated, VueVar, VueWatched} from "./libs/VueAnnotate/VueAnnotate";
import {Utils} from "./Utils";
import {Uuid} from "./Uuid";
import {DisplayCellUrl, WidgetUrl} from "./Widgets/WidgetUrl";
import {DisplayCellTradingview, TradingviewWidget} from "./Widgets/TradingviewWidget";

let extensionId = window.location.href.startsWith('http://localhost') || window.location.href.startsWith('https://cemonneau.github.io/') ? 'omkoogckomimodfhcfkbpmflamheipfb' : 'mjoenlgcmnkonkmnjmlebkojpfcnkjfk';

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
	blackTimer:boolean,
	fullscreen:boolean,
}


enum DisplayCellType{
	BLANK='BLANK',
	URL='URL',
	TRADINGVIEW='TRADINGVIEW',
	TWITTER='TWITTER',
}
export type DisplayCellBlank = {};

type DisplayCell = {
	id:string,
	type:DisplayCellType,
	data:DisplayCellBlank|DisplayCellUrl|DisplayCellTradingview,
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
						this.getDefaultCell()
					],
				},
			],
			mergedCells:[]
		};
	}

	protected getDefaultCellOptions() : DisplayCellOptions{
		return {
			reloadTimer:0,
			hideOverflow:false,
			blackTimer:false,
			fullscreen:false,
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

	protected getDefaultCell() : DisplayCell{
		return {id:Uuid.v4(),type:DisplayCellType.URL,data:{url:'https://google.fr'}, options:this.getDefaultCellOptions()};
	}

	updateDisplay(display : Display){
		this.display = this.ensureDisplayConsistency({...this.getDefaultDisplay(),...display});
		let maxCells = 0;
		for(let row of this.display.rows){
			if(maxCells < row.cells.length){
				maxCells = row.cells.length;
			}
		}
		for(let row of this.display.rows) {
			for(let i = 0; i < maxCells-row.cells.length;++i)
				row.cells.push(this.getDefaultCell());
		}

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
		let cellPos = this.getCellPosition(row, cell);
		let cellMerged = <DisplayMergedCell>this.getCellMerged(cell.id,true);
		return {...{
				width:(100/row.cells.length*cellMerged.countHorizontal)+'%',
				height:(100/this.display.rows.length*cellMerged.countVertical)+'%',
				left:(cellPos.x/row.cells.length*100)+'%',
				top:(cellPos.y/this.display.rows.length*100)+'%',
			},...this.getStyledOptionsForCell(cell)};
	}

	/**
	 * If a cell is not visible due to another one overlapping it do not show it
	 * @param row
	 * @param cell
	 */
	isCellVisible(row : DisplayRow, cell : DisplayCell) : boolean{
		return cell.type !== DisplayCellType.BLANK;
	}
	getCellMerged(cellId : string, returnIdentityMerge : boolean = false) : DisplayMergedCell|null{
		for(let mergedCellSearch of this.display.mergedCells){
			if(mergedCellSearch.primaryId === cellId)
				return mergedCellSearch;
		}
		return returnIdentityMerge ? {primaryId:cellId, countHorizontal:1, countVertical:1} : null;
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

	currentFullscreenCell : DisplayCell|null = null;
	toggleFullscreenCell(row : DisplayRow|null, cell : DisplayCell|null){
		if(this.currentFullscreenCell !== null)
			this.currentFullscreenCell = null;
		else
			this.currentFullscreenCell = cell;
	}

	/*********************************************
	 * Options management
	 *********************************************/
	toggleOptions(){
		this.optionsEnabled = !this.optionsEnabled;
	}

	addRow(){
		let emptyCells : DisplayCell[] = [];
		for(let i = 0; i < this.display.rows[0].cells.length;++i){
			emptyCells.push(this.getDefaultCell());
		}

		let newRow : DisplayRow = {
			cells:emptyCells,
		};
		this.display.rows.push(newRow);
		this.updateCounters(true);//as it triggers HTML refresh
	}
	removeRow(){
		if(this.display.rows.length > 1)
			this.display.rows.splice(this.display.rows.length-1,1);
	}
	addCell(){
		for(let row of this.display.rows) {
			row.cells.push(this.getDefaultCell());
		}
		this.updateCounters(true);//as it triggers HTML refresh
	}
	removeCell(){
		for(let row of this.display.rows) {
			if(row.cells.length-1 >= 1)
				row.cells.splice(row.cells.length-1,1);
		}
		this.updateCounters(true);//as it triggers HTML refresh
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
	extendCell(row : DisplayRow, cell : DisplayCell, direction : {x:number, y:number}){
		let cellPos = this.getCellPosition(row,cell);
		let mergedCellExist = null;
		let oldSize = {x:1,y:1};
		for(let mergedCell of this.display.mergedCells){
			if(mergedCell.primaryId === cell.id){
				oldSize = {x:mergedCell.countHorizontal,y:mergedCell.countVertical};
				mergedCell.countVertical += direction.y;
				if(mergedCell.countVertical <= 0)mergedCell.countVertical = 1;
				mergedCell.countHorizontal += direction.x;
				if(mergedCell.countHorizontal <= 0)mergedCell.countHorizontal = 1;
				mergedCellExist = mergedCell;
				break;
			}
		}
		if(mergedCellExist===null){
			mergedCellExist = {
				primaryId:cell.id,
				countHorizontal:Math.max(1+direction.x,1),
				countVertical:Math.max(1+direction.y,1),
			};
			this.display.mergedCells.push(mergedCellExist);
		}

		// TODO optimize to not trigger too many updates
		for (let x = cellPos.x; x < cellPos.x + oldSize.x; ++x) {
			for (let y = cellPos.y; y < cellPos.y + oldSize.y; ++y) {
				if (x !== cellPos.x || y !== cellPos.y) {
					this.setDefaultCellAt(x, y);
				}
			}
		}
		if(mergedCellExist.countVertical === 1 && mergedCellExist.countHorizontal === 1){
			this.display.mergedCells.splice(this.display.mergedCells.indexOf(mergedCellExist),1);
		}else {
			for (let x = cellPos.x; x < cellPos.x + mergedCellExist.countHorizontal; ++x) {
				for (let y = cellPos.y; y < cellPos.y + mergedCellExist.countVertical; ++y) {
					if (x !== cellPos.x || y !== cellPos.y) {
						this.setCellBlankAt(x, y);
					}
				}
			}
		}
	}
	setCellBlankAt(x : number, y : number){
		this.display.rows[y].cells[x].type = DisplayCellType.BLANK;
		this.display.rows[y].cells[x].data = {};
	}
	setDefaultCellAt(x : number, y : number){
		this.display.rows[y].cells[x].type = DisplayCellType.URL;
		this.display.rows[y].cells[x].data = WidgetUrl.getDefaultData();
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
