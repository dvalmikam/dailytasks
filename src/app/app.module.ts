import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { SocialLoginModule, AuthServiceConfig, GoogleLoginProvider } from "angular5-social-login";
import { getAuthServiceConfigs } from "./socialloginConfig";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {  MatButtonModule,MatToolbarModule} from '@angular/material';
import {HttpClientModule} from '@angular/common/http';
import {DataService} from './data.service';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SocialLoginModule,
    MatButtonModule,
    MatToolbarModule,
    HttpClientModule
  ],
  providers: [
    {
      provide:AuthServiceConfig,
      useFactory: getAuthServiceConfigs
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
