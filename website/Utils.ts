export class Utils{
	private static fileReader_promiseResolve : Function|null = null;
	private static fileReader_promiseReject : Function|null = null;
	static askFileContent() : Promise<string>{
		let self = this;
		let readFile = function(e : Event){
			if(!e || !e.target) {
				if (self.fileReader_promiseReject)
					self.fileReader_promiseReject('no target');
				return;
			}

			let target : HTMLInputElement = <any>e.target;
			if(!target.files) {
				if (self.fileReader_promiseReject)
					self.fileReader_promiseReject('no target');
				return;
			}

			let file = target.files[0];
			if (!file) {
				if(self.fileReader_promiseReject)self.fileReader_promiseReject('cant open file');
			}
			let reader = new FileReader();
			reader.onload = ()=>{
				if(self.fileReader_promiseResolve)
					self.fileReader_promiseResolve(reader.result);
			};
			reader.onerror = (e)=>{
				if(self.fileReader_promiseReject)
					self.fileReader_promiseReject(e);
			};
			reader.readAsText(file);
		};

		let inputElementExisting : HTMLElement|null = document.getElementById('socialManager_ui_fileReader');
		if(inputElementExisting && inputElementExisting.parentNode){
			inputElementExisting.parentNode.removeChild(inputElementExisting);
			inputElementExisting = null;
		}

		if(!inputElementExisting){
			let fileInput = document.createElement('input');
			fileInput.type = 'file';
			fileInput.style.display = 'none';
			fileInput.onchange = readFile;
			fileInput.setAttribute('id', 'socialManager_ui_fileReader');
			document.body.appendChild(fileInput);
			inputElementExisting = fileInput;
		}

		return new Promise<string>((resolve, reject)=>{
			this.fileReader_promiseResolve = resolve;
			this.fileReader_promiseReject = reject;
			// $(<any>inputElementExisting).trigger('click');
			if(inputElementExisting)
				inputElementExisting.click();
		});
	}
}