import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';


export interface task {
  _id: string,
  userid: string,
  subject: string,
  date: string,
  person_responsible: string,
  mailid: string
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  getTasks(url:string,userid:string) :Observable<task[]>
  {
    //console.log(url);
    return this.http.get<task[]>(url,{
      params:{
        userid:userid
      }
    });
  }
}
