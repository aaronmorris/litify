import { LightningElement, track } from 'lwc';
import {mapToJSON} from 'c/utilities';

const columns = [
	{label: 'Character', fieldName: 'character'},
	{label: 'ascii', fieldName: 'ascii', type: 'text'},
	{label: 'count', fieldName: 'count', type: 'text'}
];

export default class DataManipulation extends LightningElement {
	@track characterDataTable = [];
	@track chartConfiguration;
	@track decodedString = '';
	// TODO remove default value
	@track encodingString = 'Z29kIHl6YWwgZWh0IHJldm8gc3BtdWogeG9mIG53b3JiIGtjaXVxIGVoVA==';
	@track pieChartConfiguration;
	@track recordId;
	@track reversedString = '';
	@track showFields = false;

	characterMap = new Map();
	chartColors = [];
	columns = columns;
	ignoreCase = false;
	dataDisplayMap = new Map();
	removeWhitespace = false;
	removeSpecialCharacters = false;
	sortCharacters = false;

	connectedCallback() {
		// this.processData();
	}

	handleIgnoreCaseChange() {
		this.ignoreCase = !this.ignoreCase;
		this.processData();
	}

	handleNewSessionInput(event) {
		let reader = new FileReader();
		// TODO: Add in some error checking file was uploaded and is base64encoded
		reader.onload = (() => {
			this.encodedString = reader.result;
			this.processData();
		});

		reader.readAsText(event.target.files[0]);
	}

	handleRemoveSpecialCharactersChange() {
		this.removeSpecialCharacters = !this.removeSpecialCharacters;
		this.processData();
	}

	handleRemoveWhitespaceChange() {
		this.removeWhitespace = !this.removeWhitespace;
		this.processData();
	}

	handleSortCharactersChange() {
		this.sortCharacters = !this.sortCharacters;
		this.processData();
	}

	handleSuccess(event) {
		this.recordId = event.detail.id;
		this.resetData();
	}

	analyzeString() {
		let base = this.ignoreCase ? this.reversedString.toUpperCase() : this.reversedString;
		if (this.sortCharacters) {
			base = base.split('').sort().join('');
		}

		if (this.removeWhitespace) {
			base = base.replace(/\s+/g, '');
		}

		if (this.removeSpecialCharacters) {
			base = base.replace(/[^A-Za-z0-9\s]/g,'');
		}

		let stringLength = base.length;

		for (let i = 0; i < stringLength; i++) {
			let key = base[i];
			let characterCount = this.characterMap.get(key);
			characterCount = characterCount == null ? 1 : characterCount + 1;
			this.characterMap.set(key, characterCount);
			this.dataDisplayMap.set(key + ':' + key.charCodeAt(0), characterCount);

		}

		this.createDateTable();
	}

	createDateTable() {
		this.characterDataTable = [];
		let component = this;
		this.characterMap.forEach(function(value, key) {
			let row = {
				character: key,
				ascii: key.charCodeAt(0).toString(),
				count: value.toString()
			};

			component.characterDataTable.push(row);

			let r = Math.floor(Math.random() * 200);
			let g = Math.floor(Math.random() * 200);
			let b = Math.floor(Math.random() * 200);
			component.chartColors.push('rgb(' + r + ', ' + g + ', ' + b + ')');
		});
	}

	processData() {
		this.resetData();
		this.showFields = true;
		this.decodedString = window.atob(this.encodedString);
		this.reverseString();
		this.analyzeString();
		this.setChartConfiguration();
		this.updateChart();
	}

	resetData() {
		this.decodedString = '';
		this.reversedString = '';
		this.characterMap = new Map();
		this.dataDisplayMap = new Map();
		this.chartConfiguration = {};
	}

	reverseString() {
		this.reversedString = this.decodedString.split('').reverse().join('');
	}

	setChartConfiguration() {
		this.pieChartConfiguration = {
			type: 'pie',
			data: {
				labels: [...this.characterMap.keys()],
				datasets: [
					{
					label: 'Letter Frequency',
					data: [...this.characterMap.values()],
					backgroundColor: this.chartColors
					}
				]
			}
		}
		this.chartConfiguration = {
			type: 'bar',
			data: {
				labels: [...this.characterMap.keys()],
				datasets: [
				{
					label: 'Letter Frequency',
					barPercentage: 0.5,
					barThickness: 6,
					maxBarThickness: 8,
					minBarLength: 2,
					backgroundColor: 'blue',
					data: [...this.characterMap.values()]
				},
				],
			},
			options: {
				scales: {
					yAxes: [{
						ticks: {
							min: 0
						}
					}]
				}
			},
		};
	}

	updateChart() {
		this.template.querySelector('[data-id="barChart"]').updateChart(this.chartConfiguration);
		this.template.querySelector('[data-id="pieChart"]').updateChart(this.pieChartConfiguration);
	}
}