import { Component } from '@angular/core';
import { OkapiService } from './services/okapi.service';
import { FileService } from './services/file.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'OkapiAngularConnector';
  baseUrl = <Add the OKAPI URL and Port here like so 'http://IP:Port>';
  username = < username >;
  password = < password >;
  
  token: any;
  header: any;
  request_id: any;
  request: any;
  result: any;

  constructor(okapi: OkapiService,
              file: FileService ) {
    okapi.authorize(this.username, this.password).then(
      (value) => {
        this.header = value;
        this.token = value['access_token'];
        const riskBody = {
          'conjunction': {
            'type': 'cdm.json',
            'content': ''
          }
        }
        file.getJSON().subscribe(
          (fileContent) => {
            riskBody.conjunction.content = fileContent[0];
            okapi.getRequest(this.baseUrl,'/estimate-risk/alfano-2005/requests', JSON.stringify(riskBody)).subscribe(
              (requestResponse) => {
                this.request_id = requestResponse['request_id'];
                this.request = requestResponse;
                okapi.getResult(this.baseUrl,'/estimate-risk/alfano-2005/results', this.request, 'simple').subscribe(
                  (resultResponse) => {
                    // console.log(resultResponse);
                    this.result = JSON.stringify(resultResponse['risk_estimations']);
                  }
                );
              }
            );
          }
        );
      }
    );
  }
}
