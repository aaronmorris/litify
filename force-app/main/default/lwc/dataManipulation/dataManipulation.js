import { LightningElement, track } from 'lwc';
import {mapToJSON} from 'c/utilities';

export default class DataManipulation extends LightningElement {
	@track characterData = '';
	@track chartConfiguration;
	@track decodedString = '';
	@track encodingString = '';
	@track reversedString = '';
	@track showFields = false;

	characterMap = new Map();
	chartData = [];
	chartLabels = [];
	ignoreCase = false;
	sortCharacters = false;

	handleIgnoreCaseChange() {
		this.ignoreCase = !this.ignoreCase;
		this.processData();
		this.updateChart();
	}

	handleNewSessionInput(event) {
		let reader = new FileReader();
		// TODO: Add in some error checking
		reader.onload = (() => {
			this.encodedString = reader.result;
			this.processData();
			this.updateChart();
		});

		reader.readAsText(event.target.files[0]);
	}

	handleSortCharactersChange() {
		this.sortCharacters = !this.sortCharacters;
		this.processData();
		this.updateChart();
	}

	handleSuccess(event) {
		this.recordId = event.detail.id;
		this.resetData();
		console.log('this.recordId: ' + this.recordId);
	}

	loadChartData() {
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
					data: this.chartData
				},
				],
			},
			options: {
				scales: {
					yAxes: [{
						// display: true,
						// stacked: true,
						ticks: {
							min: 0
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

	resetData() {
		// this.encodedString = this.template.querySelector('[data-id="encoded"]').value;
		this.decodedString = '';
		this.reversedString = '';
		this.characterMap = new Map();
		this.chartConfiguration = {};
	}

	// This method works, but it is doing too much too inefficiently.
	// Figure out a better way to do this
	reverseString() {
		let stringLength = this.decodedString.length;

		for (let i = stringLength - 1; i >= 0; i--) {
			this.reversedString += this.decodedString[i];
			let key = this.ignoreCase ? this.decodedString[i].toUpperCase() : this.decodedString[i];
			let characterCount = this.characterMap.get(key);
			characterCount = characterCount == null ? 1 : characterCount + 1;
			this.characterMap.set(key, characterCount);
		}

		if (this.sortCharacters) {
			let sortedString = '';
			if (this.ignoreCase) {
				sortedString = this.decodedString.toUpperCase().split('').sort();
			}
			else {
				sortedString = this.decodedString.split('').sort();
			}

			this.characterMap = new Map();
			for (let i = 0; i < stringLength; i++) {
				let key = this.ignoreCase ? sortedString[i].toUpperCase() : sortedString[i];
				let characterCount = this.characterMap.get(key);
				characterCount = characterCount == null ? 1 : characterCount + 1;
				this.characterMap.set(key, characterCount);
			}
		}

		this.chartLabels = [];
		this.chartData = [];
		let that = this;
		this.characterMap.forEach(function (value, key) {
			that.chartLabels.push(key);
			that.chartData.push(value);
		});
		console.log('after');
		this.characterData = mapToJSON(this.characterMap);
	}

	updateChart() {
		this.template.querySelector('c-chart').updateChart(this.chartConfiguration);
	}
}