import { Component} from '@angular/core';
import {  MatButtonModule,MatToolbarModule} from '@angular/material';
import { AuthService, GoogleLoginProvider, SocialUser } from "angular5-social-login";
import { HttpClient } from '@angular/common/http';
import { DataService, task} from './data.service';
import { DxSchedulerModule, DxTemplateModule } from 'devextreme-angular';
import Query from 'devextreme/data/query';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'task-app';
  isLoggedIn = false;
  loginToken:SocialUser;
  currentDate: Date = new Date();
  public dailytasks: task[];
  loggedInToken:SocialUser;

  constructor(private socialAuthService: AuthService, 
    private http:HttpClient, private dataService:DataService ) {
      this.loginToken = this.dataService.getSession();
      //console.log(this.loginToken);
      if(this.loginToken==undefined)
      {
        this.isLoggedIn= false;
      }
      else
      {
        this.isLoggedIn= true;
        this.getTasks();
      }
    }
  login()
  {
    let socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;

    this.socialAuthService.signIn(socialPlatformProvider).then(
      (userData) => { //on success
        this.dataService.setSession(userData);
        this.isLoggedIn= true;
        this.loginToken = userData;
        
        this.getTasks();
      }
    );
  }

  logout()
  {
    this.socialAuthService.signOut().then(
      (userData) => { //on success
        this.isLoggedIn= false;
        this.dataService.clearSession();
      }
    );
  }

  getTasks() 
  {
    this.dataService.getTasks('http://localhost:8083/api/tasks/?userid='+this.loginToken.id)
    .subscribe(resp=>{  
      this.dailytasks = resp.data;
    
      for(let i=0;i<this.dailytasks.length;i++)
        {
          this.dailytasks[i].startDate = new Date(this.dailytasks[i].startDate);
          this.dailytasks[i].endDate = new Date(this.dailytasks[i].endDate); 
        }
    });
  }

  getTaskById(id:string)
  {
    return Query(this.dailytasks).filter(["_id", "=", id]).toArray()[0];
  }

  onAppointmentFormCreated(data) {
    var that = this,
        form = data.form,
        taskInfo = that.getTaskById(data.appointmentData._id) || {},
        startDate = data.appointmentData.startDate;

    form.option("items", [
        {
          label: {
              text: "Subject"
          },
          editorType: "dxTextBox",
          dataField: "text"
        }, 
        {
          label: {
              text: "Responsible"
          },
          name: "person_responsible",
          editorType: "dxTextBox",
          dataField: "person_responsible",
          editorOptions: {
            value: taskInfo.person_responsible
         }
        }, 
        {
          dataField: "startDate",
          editorType: "dxDateBox",
          editorOptions: {
              width: "100%",
              type: "datetime",
              onValueChanged: function(args) {
                  startDate = args.value;
                  form.getEditor("endDate")
                      .option("value", new Date (startDate.getTime() + 30));
              }
            }   
         }, 
         {
            name: "endDate",
            dataField: "endDate",
            editorType: "dxDateBox",
            editorOptions: {
                width: "100%",
                type: "datetime"
            }
          },
          {
            label: {
                text: "Mail Ids"
            },
            editorType: "dxTextBox",
            dataField: "mailid"
          }
    ]);
}

  onAppointmentAdded (e) {
  //console.log(e.appointmentData);
    let newTask = {endDate : e.appointmentData.endDate,
      mailid :e.appointmentData.mailid, 
      person_responsible : e.appointmentData.person_responsible, 
      startDate: e.appointmentData.startDate,
      text : e.appointmentData.text,
      userid : this.loginToken.id,
      _id:''
    };

    this.dataService.insertTask('http://localhost:8083/api/tasks/', newTask)
    .subscribe(resp=>{  
      alert(resp);
      this.getTasks() ;
    });
  }
  onAppointmentUpdated (e) {
    //console.log(e);
    let updatedTask = e.appointmentData;
    this.dataService.updateTask('http://localhost:8083/api/tasks/'+e.appointmentData._id, updatedTask)
      .subscribe(resp=>{  
        alert(resp);
        this.getTasks() ;
    });
  }
  onAppointmentDeleted (e) {
    //console.log(e);
    this.dataService.deleteTask('http://localhost:8083/api/tasks/'+e.appointmentData._id)
      .subscribe(resp=>{  
        alert(resp);
        this.getTasks() ;
    });
  }
}

