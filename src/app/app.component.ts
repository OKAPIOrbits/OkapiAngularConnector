import { Component } from '@angular/core';
import { OkapiService } from './services/okapi.service';
import { FileService } from './services/file.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
 
  hide = true;
  baseUrl = '';
  username = '';
  password = '';
  endpoint = '';

  riskBody = {
    'conjunction': {
      'type': 'cdm.json',
      'content': ''
    }
  }

  riskBodyString = '';
  resultString = '';
  
  token: any;
  header: any;
  request_id: any;
  request: any;
  result: any;

  constructor(private okapi: OkapiService,
              private file: FileService ) {
  }

  authorize(): void {
    this.okapi.authorize(this.username, this.password).then(
      (value) => {
        this.header = value;
        this.token = value['access_token'];
      });
  }

  loadCDM(): void {
    this.file.getJSON().subscribe(
      (fileContent) => {
        this.riskBody.conjunction.content = fileContent[0];
        this.riskBodyString = JSON.stringify(this.riskBody);
      });
  }

  send(): void {
    this.okapi.getRequest(this.baseUrl, this.endpoint + '/requests', JSON.stringify(this.riskBody)).subscribe(
      (requestResponse) => {
        this.request_id = requestResponse['request_id'];
        this.request = requestResponse;
        this.okapi.getResult(this.baseUrl, this.endpoint + '/results', this.request, 'simple').subscribe(
          (resultResponse) => {
            // console.log(resultResponse);
            this.result = resultResponse['risk_estimations'];
            this.resultString = JSON.stringify(this.result);
          }
        );
      });
  }

}
