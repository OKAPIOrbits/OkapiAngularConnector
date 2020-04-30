import { Component, OnInit } from '@angular/core';
import { OkapiService } from './services/okapi.service';
import { FileService } from './services/file.service';
import * as moment from 'moment';
import { PlotlyService } from 'angular-plotly.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  hide = true;
  baseUrl = 'http://platform.okapiorbits.com';
  username = '';
  password = '';

  riskBody = {
    conjunction: {
      type: 'cdm.json',
      content: ''
    },
    overrides: {
      type: 'cdm_overrides.json',
      content: {}
    }
  };

  collisionProbability = 0.0;
  newCollisionProbability = 0.0;
  newPredictedCollisionProbability = 0.0;

  riskBodyString = '';
  token: any;
  header: any;
  request_id: any;
  prediction_request_id: any;
  result: any;
  prediction_result: any;
  sat1HardBodyRadiusOverride = 0.0;
  radialOverride = 0.0;
  creationDate: any;
  tca: any;
  toTCA: any;

  private x: number[] = new Array();
  private x2: number[] = new Array();
  private y: number[] = new Array();
  private y2: number[] = new Array();
  public graph;

  constructor(private okapi: OkapiService,
              private file: FileService,
              public plotlyService: PlotlyService) {
  }

  authorize(): void {
    this.okapi.authorize(this.username, this.password).then(
      (value) => {
        this.header = value;
        this.token = value['Authorization'];
      });
  }

  loadCDM(): void {
    this.file.getJSON('assets/cdm-1.json').subscribe(
      (fileContent) => {
        this.riskBody.conjunction.content = fileContent[0];
        this.collisionProbability = +this.riskBody.conjunction.content['COLLISION_PROBABILITY'];
        // this.y2.push(this.collisionProbability);
        this.creationDate = moment(this.riskBody.conjunction.content['CREATION_DATE']);
        this.tca = moment(this.riskBody.conjunction.content['TCA']);
        // this.x2.push(this.tca.diff(this.creationDate) / 1000 / 3600);
        this.toTCA = moment(this.riskBody.conjunction.content['TCA']).from(this.riskBody.conjunction.content['CREATION_DATE']);
        this.riskBodyString = JSON.stringify(this.riskBody);
      });
  }

  sendRiskEstimationRequest(): void {
    if (this.sat1HardBodyRadiusOverride !== 0.0) {
      this.riskBody.overrides.content['SAT1_HARD_BODY_RADIUS'] = +this.sat1HardBodyRadiusOverride;
    } else {
      delete this.riskBody.overrides.content['SAT1_HARD_BODY_RADIUS'];
    }
    if (this.radialOverride !== 0.0) {
      this.riskBody.overrides.content['RELATIVE_POSITION_R'] = +this.radialOverride;
    } else {
      delete this.riskBody.overrides.content['RELATIVE_POSITION_R'];
    }
    const endpoint = '/estimate-risk/foster-1992';
    this.okapi.getRequest(this.baseUrl, endpoint + '/requests', JSON.stringify(this.riskBody)).subscribe(
      (requestResponse) => {
        this.request_id = requestResponse['request_id'];
        const request: any = requestResponse;
        this.okapi.getResult(this.baseUrl, endpoint + '/results', request, 'simple').subscribe(
          (resultResponse) => {
            // console.log(resultResponse);
            this.result = resultResponse['risk_estimations'];
            this.newCollisionProbability = +this.result.content[0]['collision_probability'];
          }
        );
      });
  }

  sendRiskPredictionRequest(): void {
    if (this.sat1HardBodyRadiusOverride > 0.0) {
      this.riskBody.overrides.content['SAT1_HARD_BODY_RADIUS'] = +this.sat1HardBodyRadiusOverride;
    } else {
      delete this.riskBody.overrides.content['SAT1_HARD_BODY_RADIUS'];
    }
    if (this.radialOverride > 0.0) {
      this.riskBody.overrides.content['RELATIVE_POSITION_R'] = +this.radialOverride;
    } else {
      delete this.riskBody.overrides.content['RELATIVE_POSITION_R'];
    }
    const endpoint = '/predict-risk/foster-1992';
    this.okapi.getRequest(this.baseUrl, endpoint + '/requests', JSON.stringify(this.riskBody)).subscribe(
      (requestResponse) => {
        this.prediction_request_id = requestResponse['request_id'];
        const request: any  = requestResponse;
        this.okapi.getResult(this.baseUrl, endpoint + '/results', request, 'simple').subscribe(
          (resultResponse) => {
            console.log(resultResponse['risk_predictions']);
            this.prediction_result = resultResponse['risk_predictions'];
            this.newPredictedCollisionProbability = this.prediction_result.content[0]['collision_probability'];
            const riskTrend = this.prediction_result.content[0]['risk_trend'];
            console.log(riskTrend);
            riskTrend.forEach(element => {
              this.x.push(element['time_to_tca']/3600);
              this.y.push(element['collision_probability']);
            });
          }
        );
      });
  }

  loadSingleCDM(filename: string): void {
    const riskBody = {
      conjunction: {
        type: 'cdm.json',
        content: ''
      },
      overrides: {
        type: 'cdm_overrides.json',
        content: {}
      }
    };
    this.file.getJSON('assets/' + filename).subscribe(
      (fileContent) => {
        riskBody.conjunction.content = fileContent[0];
        this.y2.push(+riskBody.conjunction.content['COLLISION_PROBABILITY']);
        const creationDate = moment(riskBody.conjunction.content['CREATION_DATE']);
        const tca = moment(riskBody.conjunction.content['TCA']);
        this.x2.push(tca.diff(creationDate) / 1000 / 3600);
        // const graphDiv = this.plotlyService.getInstanceByDivId('graphDivID');
        this.plotlyService.getPlotly().update('graphDivID', this.graph.data, this.graph.layout, this.graph.config);
      });
  }

  loadCDM1(): void {
    this.loadSingleCDM('cdm-1.json');
    console.log(this.x2, this.y2);
  }

  loadCDM2(): void {
    this.loadSingleCDM('cdm-2.json');
    console.log(this.x2, this.y2);
  }

  loadCDM3(): void {
    this.loadSingleCDM('cdm-3.json');
    console.log(this.x2, this.y2);
  }

  loadCDM4(): void {
    this.loadSingleCDM('cdm-4.json');
    console.log(this.x2, this.y2);
  }

  loadCDM5(): void {
    this.loadSingleCDM('cdm-5.json');
    console.log(this.x2, this.y2);
  }

  loadCDM6(): void {
    this.loadSingleCDM('cdm-6.json');
    console.log(this.x2, this.y2);
  }

  ngOnInit() {
    this.graph = {
      data: [
          {
            x: this.x,
            y: this.y,
            name: 'OKAPI Probability',
            type: 'scatter',
            mode: 'lines+markers'
          },
          {
            x: this.x2,
            y: this.y2,
            name: 'USSpaceCOM',
            type: 'scatter',
            mode: 'markers',
            marker: {size: 10}
          },
      ],
      layout: {
        xaxis: {
          // type: 'log',
          title: 'Time to TCA / h',
          autorange: true,
        },
        yaxis: {
          type: 'log',
          autorange: true,
          tickformat: '.3e', // https://github.com/d3/d3-format/blob/master/README.md#locale_format
          title: 'Collision Risk / -'
        },
        // width: 500,
        // height: 500,
        title: 'Risk Forecast'}
      };
  }

}
