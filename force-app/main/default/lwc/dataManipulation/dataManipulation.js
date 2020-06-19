import { LightningElement, api, track } from 'lwc';

export default class DataManipulation extends LightningElement {
	@track recordId;
	@track showFields = false;
	@track chartConfiguration;

	// TODO: Delete these
	@track encodedString = 'Z29kIHl6YWwgZWh0IHJldm8gc3BtdWogeG9mIG53b3JiIGtjaXVxIGVoVA==';
	// french fires: ZnJlbmNoIGZyaWVz
	@track decodedString = '';
	@track reversedString = '';
	@track characterData = '';
	characterMap = new Map();
	chartData = [];
	chartLabels = [];
	ignoreCase = false;
	sortCharacters = false;

	connectedCallback() {
		console.log('connectedCallback');
		console.log(this.encodedString);
		// this.decodedString = window.atob(this.encodedString);
		// console.log('decodedString: ' + this.decodedString);
		// this.reverseString();
		this.processData();
	}

	handleCreateNewRecordClick() {

	}

	handleSortCharactersChange() {
		this.sortCharacters = !this.sortCharacters;
		this.processData();
		this.updateChart();
	}

	handleIgnoreCaseChange() {
		this.ignoreCase = !this.ignoreCase;
		console.log('this.ignoreCase: ' + this.ignoreCase);
		this.processData();
		this.updateChart();
	}

	handleReadAndManipulateClick() {
		this.resetData();
		console.log('handleReadAndManipulateClick encodedString: ' + this.encodedString);
		this.decodedString = window.atob(this.encodedString);
		console.log('decodedString: ' + this.decodedString);
		this.reverseString();
		// this.template.querySelector('[data-id="Encoded__c"').value = this.encodedString;
	}

	handleSuccess(event) {
		this.recordId = event.detail.id;
		this.resetData();
		console.log('this.recordId: ' + this.recordId);
	}

	loadChartData() {
		let data = this.mapToJSON(this.characterMap);
		console.log('data: ' + data);
		console.log('chartData: ' + this.chartData);
		console.log('chartLabels: ' + this.chartLabels);
		this.chartConfiguration = {
			type: 'bar',
			data: {
				labels: this.chartLabels,
				datasets: [
				{
					label: 'Character Count',
					barPercentage: 0.5,
					barThickness: 6,
					maxBarThickness: 8,
					minBarLength: 2,
					backgroundColor: "green",
					// data: this.mapToJSON(this.characterMap),
					data: this.chartData
				},
				],
			},
			options: {
				scales: {
					yAxes: [{
						display: true,
						stacked: true,
						ticks: {
							min: 0, // minimum value
							// max: 10 // maximum value
						}
					}]
				}
			},
		};
	}

	processData() {
		this.resetData();
		this.showFields = true;
		this.decodedString = window.atob(this.encodedString);
		this.reverseString();
		this.loadChartData();
	}

	handleNewSessionInput(event) {
		let reader = new FileReader();
		reader.onload = (() => {
			this.encodedString = reader.result;
			this.processData();
			this.updateChart();
		});

		reader.readAsText(event.target.files[0]);
	}

	resetData() {
		// this.encodedString = this.template.querySelector('[data-id="encoded"]').value;
		this.decodedString = '';
		this.reversedString = '';
		this.characterMap = new Map();
		this.chartConfiguration = {};
	}

	reverseString() {
		let stringLength = this.decodedString.length;

		for (let i = stringLength - 1; i >= 0; i--) {
			this.reversedString += this.decodedString[i];
			let key = this.ignoreCase ? this.decodedString[i].toUpperCase() : this.decodedString[i];
			let characterCount = this.characterMap.get(key);
			characterCount = characterCount == null ? 1 : characterCount + 1;
			this.characterMap.set(key, characterCount);
		}

		// This is not efficient
		let unsortedMap = new Map();
		if (this.sortCharacters) {
			let sortedString = '';
			if (this.ignoreCase) {
				sortedString = this.decodedString.toUpperCase().split('').sort();
			}
			else {
				sortedString = this.decodedString.split('').sort();
			}
			//unsortedMap = this.characterMap();
			console.log('sortedString: ' + sortedString);
			this.characterMap = new Map();
			//stringLength = sortedString.length;
			for (let i = 0; i < stringLength; i++) {
				// this.sortedString += this.decodedString[i];
				let key = this.ignoreCase ? sortedString[i].toUpperCase() : sortedString[i];
				// let key = sortedString[i];
				let characterCount = this.characterMap.get(key);
				characterCount = characterCount == null ? 1 : characterCount + 1;
				this.characterMap.set(key, characterCount);
			}
		}

		console.log('this.reversedString: ' + this.reversedString);
		console.log(this.characterMap);
		this.chartLabels = [];
		this.chartData = [];
		let that = this;
		this.characterMap.forEach(function (value, key) {
			console.log(key + ':' + value);
			that.chartLabels.push(key);
			that.chartData.push(value);
		});
		console.log('after');
		this.characterData = this.mapToJSON(this.characterMap);
	}

	// TODO: Move to utility
	mapToJSON(map) {
		return JSON.stringify([...map]);
	}

	// TODO: Move to utility
	jsonToMap(jsonString) {
		return new Map(JSON.parse(jsonString));
	}

	handleUploadFinished() {
		console.log('uploaded:');
	}

	updateChart() {
		this.template.querySelector('c-chart').updateChart(this.chartConfiguration);
	}
}