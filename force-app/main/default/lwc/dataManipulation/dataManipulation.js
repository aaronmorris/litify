import { LightningElement, track } from 'lwc';
import {isBase64, showToastMessage} from 'c/utilities';

const columns = [
	{label: 'Character', fieldName: 'character'},
	{label: 'ascii', fieldName: 'ascii', type: 'text'},
	{label: 'count', fieldName: 'count', type: 'text'}
];

export default class DataManipulation extends LightningElement {
	@track characterDataTable = [];
	@track chartConfiguration;
	@track decodedString = '';
	@track encodingString = '';
	@track pieChartConfiguration;
	@track reversedString = '';
	@track showFields = false;

	characterMap = new Map();
	chartColors = [];
	columns = columns;
	ignoreCase = false;
	removeWhitespace = false;
	removeSpecialCharacters = false;
	sortCharacters = false;

	handleIgnoreCaseChange() {
		this.ignoreCase = !this.ignoreCase;
		this.processData();
	}

	handleNewSessionInput(event) {
		let reader = new FileReader();
		reader.onload = (() => {
			this.encodedString = reader.result;
			if (isBase64(this.encodedString)) {
				this.processData();
			}
			else {
				showToastMessage('error', 'Invalid Encoding', 'The contents of the uploaded file are not base64 encoded.');
				this.resetData();
				this.showFields = false;
			}
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

	analyzeString() {
		let filteredString = this.filterReversedString();
		let stringLength = filteredString.length;

		for (let i = 0; i < stringLength; i++) {
			let key = filteredString[i];
			let characterCount = this.characterMap.get(key);
			characterCount = characterCount == null ? 1 : characterCount + 1;
			this.characterMap.set(key, characterCount);
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

	filterReversedString() {
		let filtered = this.ignoreCase ? this.reversedString.toUpperCase() : this.reversedString;
		if (this.sortCharacters) {
			filtered = filtered.split('').sort().join('');
		}

		if (this.removeWhitespace) {
			filtered = filtered.replace(/\s+/g, '');
		}

		if (this.removeSpecialCharacters) {
			filtered = filtered.replace(/[^A-Za-z0-9\s]/g,'');
		}

		return filtered;
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
		let barChart = this.template.querySelector('[data-id="barChart"]');
		if (barChart != null) {
			barChart.updateChart(this.chartConfiguration);
		}

		let pieChart = this.template.querySelector('[data-id="pieChart"]');
		if (pieChart != null) {
			pieChart.updateChart(this.pieChartConfiguration);
		}
	}
}