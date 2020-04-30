import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  // private _jsonURL = 'assets/cdm.json';

  constructor(private http: HttpClient) {
    // this.getJSON().subscribe(data => {
    // });
  }

  public getJSON(jsonURL): Observable<any> {
    return this.http.get(jsonURL);
  }
}
