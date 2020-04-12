import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { retryWhen, concatMap, delay, flatMap } from 'rxjs/operators';

export interface AccessToken {
  "Content-Type": string;
  Accept: string;
  access_token: string;
  expires_in: string;
  token_type: string;
  scope: string;
}

@Injectable({
  providedIn: 'root'
})
export class OkapiService {

  okapiToken: AccessToken = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    access_token: '',
    expires_in: '',
    token_type: '',
    scope: ''
  };

  constructor(private http: HttpClient) { }

  async authorize(username: string, password: string) {
    const auth0Url = 'https://okapi-development.eu.auth0.com/oauth/token';
    const postBody = {
      grant_type: 'password',
      username: username,
      password: password,
      audience: 'https://api.okapiorbits.space/picard',
      scope: ('neptune_propagation neptune_propagation_request ' +
                'pass_predictions pass_prediction_requests ' +
                'pass_predictions_long pass_prediction_requests_long'),
      client_id: 'jrk0ZTrTuApxUstXcXdu9r71IX5IeKD3',
    }
    return new Promise((resolve) => {
      this.http.post(auth0Url, postBody, { responseType: 'json' }).subscribe(
        (val) => {
          this.okapiToken.access_token = val['access_token'];
          this.okapiToken.expires_in = val["expires_in"];
          this.okapiToken.token_type = val['token_type'];
          this.okapiToken.scope = val['scope'];
          resolve(this.okapiToken);
        });
    });
  }

  getRequest(baseUrl: string, okapiEndpoint: string, postBody: string) {
    return this.http.post(baseUrl + okapiEndpoint, postBody,
        {
          headers: {
            'Content-Type': this.okapiToken['Content-Type'],
            Accept: this.okapiToken.Accept,
            access_token: this.okapiToken.access_token, // Legacy
            Authorization: 'Bearer ' + this.okapiToken.access_token,
            expires_in: this.okapiToken.expires_in,
            token_type: this.okapiToken.token_type,
            scope: this.okapiToken.scope,
          },
          responseType: 'json'
        });
  }

  getResult(baseUrl: string, okapiEndpoint: string, request: string, resultType: string) {
    return this.http.get(baseUrl + okapiEndpoint + '/' + request['request_id'] + '/' + resultType,
        {
          headers: {
            'Content-Type': this.okapiToken['Content-Type'],
            Accept: this.okapiToken.Accept,
            access_token: this.okapiToken.access_token, // Legacy
            Authorization: 'Bearer ' + this.okapiToken.access_token,
            expires_in: this.okapiToken.expires_in,
            token_type: this.okapiToken.token_type,
            scope: this.okapiToken.scope,
          },
          observe: 'response'
        }).pipe(
          concatMap(response => {
            // console.log(response.status);
            if (response.status === 202) {
                throw of(response.status);
            }
            return of(response.body);
          }),
          retryWhen(response => {
            return response.pipe(
              // tap(() => console.log("Waiting for result")),
              delay(200), // Wait 200ms before the next request
              flatMap((error: any) => {
                return of(error);
              })
            )
        })
      );
  }
}
