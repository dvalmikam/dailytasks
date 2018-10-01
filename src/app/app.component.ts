import { Component } from '@angular/core';
import {  MatButtonModule,MatToolbarModule} from '@angular/material';
import { AuthService, GoogleLoginProvider, SocialUser } from "angular5-social-login";
import { HttpClient } from '@angular/common/http';
import {DataService} from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'task-app';
  isLoggedIn = false;
  loginToken:SocialUser;

  constructor( private socialAuthService: AuthService, 
    private http:HttpClient, private dataService:DataService ) {}
  login()
  {
    let socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;

    this.socialAuthService.signIn(socialPlatformProvider).then(
      (userData) => { //on success
        this.isLoggedIn= true;
        this.loginToken = userData;

        console.log(userData);
        //this will return user data from google. What you need is a user token which you will send it to the server
        this.sendToRestApiMethod(this.loginToken);
      }
    );
  }

  logout()
  {
    this.socialAuthService.signOut().then(
      (userData) => { //on success
        this.isLoggedIn= false;
        //alert(userData);
      }
    );
  }

  sendToRestApiMethod(token: SocialUser) 
  {
    this.dataService.getTasks('http://localhost:8083/api/tasks',token.id)
    .subscribe(resp=>{
      console.log(resp);
    });
  }
}
