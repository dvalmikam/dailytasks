import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
//import { SrvRecord } from 'dns';
import { SESSION_STORAGE, StorageService } from 'ngx-webstorage-service';
import { SocialUser } from 'angular5-social-login';

const STORAGE_KEY = '';


export interface task {
  _id: string,
  userid: string,
  text: string,
  startDate: Date,
  endDate:Date,
  person_responsible: string,
  mailids: groupmember[]
}

export interface groupmember {
  member: string
}

export interface user {
  _id:string,
  userid:String,
  group_members:groupmember[]
}

@Injectable({
  providedIn: 'root'
})
export class DataService 
{
  constructor(@Inject(SESSION_STORAGE) private storage: StorageService,
  private http: HttpClient) { }

  getMembers(url:string) :Observable<user[]>
  {
    return this.http.get<user[]>(url);
  }
  insertMember(url:string,userMembers:user)
  {
    return this.http.put(url,userMembers)
  }
  deleteMember(url:string)
  {
    return this.http.delete(url);
  }

  getTasks(url:string) :Observable<task[]>
  {
    //console.log(url);
    return this.http.get<task[]>(url);
  }

  insertTask(url:string,newTask:task)
  {
    return this.http.post(url,newTask)
  }
  updateTask(url:string,updatedTask:task)
  {
    return this.http.put(url,updatedTask)
  }
  deleteTask(url:string)
  {
    return this.http.delete(url);
  }

  setSession(userData:SocialUser)
  {
    this.storage.set(STORAGE_KEY, userData);
  }
  getSession()
  {
    return this.storage.get(STORAGE_KEY);
  }
  clearSession()
  {
    this.storage.clear();
  }
}
