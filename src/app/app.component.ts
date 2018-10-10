import { Component} from '@angular/core';
import {  MatButtonModule,MatToolbarModule} from '@angular/material';
import { AuthService, GoogleLoginProvider, SocialUser } from "angular5-social-login";
import { HttpClient } from '@angular/common/http';
import { DataService, task, groupmember} from './data.service';
import { DxSchedulerModule, DxTemplateModule,DxTagBoxModule } from 'devextreme-angular';
import Query from 'devextreme/data/query';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent 
{
  title = 'task-app';
  isLoggedIn = false;
  loginToken:SocialUser;
  currentDate: Date = new Date();
  public dailytasks: task[];
  public groupmembers:groupmember[];

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
        this.getMembers();
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
        this.getMembers();
        this.getTasks();
      }
    );
  }

  logout()
  {
    this.socialAuthService.signOut().then(
      (userData) => { //on success
        this.dailytasks = null;
        this.isLoggedIn= false;
        this.dataService.clearSession();
      }
    );
  }

  getMembers()
  {
    this.dataService.getMembers('http://localhost:8083/api/members/?userid='+this.loginToken.id)
    .subscribe(resp=>{  
      this.groupmembers = resp;
      this.groupmembers.push({'member':this.loginToken.email});
    },err=>{
      console.log(err.message);
      this.groupmembers=[];
      this.groupmembers.push({'member':this.loginToken.email});
    });
  }

  getTasks() 
  {
    this.dataService.getTasks('http://localhost:8083/api/tasks/?userid='+this.loginToken.id+'&email='+this.loginToken.email)
    .subscribe(resp=>{  
      //console.log(resp);
      this.dailytasks = resp;
    
      for(let i=0;i<this.dailytasks.length;i++)
        {
          this.dailytasks[i].startDate = new Date(this.dailytasks[i].startDate);
          this.dailytasks[i].endDate = new Date(this.dailytasks[i].endDate); 
        }
    },err=>{
      console.log(err.message);
      this.dailytasks = [];
    });
  }

  getTaskById(id:string)
  {
    return Query(this.dailytasks).filter(["_id", "=", id]).toArray()[0];
  }

  onAppointmentFormCreated(data) 
  {
    var that = this,
    startDate = data.appointmentData.startDate,
    form = data.form;
    //taskInfo = that.getTaskById(data.appointmentData._id) || {};
    //form.itemOption("text","isRequired",true);
    //form.itemOption("ownerId","isRequired",true); 
    data.form.option('labelLocation', 'top');
    data.form.option('showColonAfterLabel', true);
    data.form.option('colCount', 2);
    data.form.option('showValidationSummary', false);
    
    form.option("items", [
      {
        label: {text: "Subject"},
        editorType: "dxTextBox",
        dataField: "text",
        // editorOptions: {width: "50%"},
        validationRules:[{type:"required"}]
      }, 
      {
        label: {text: "Responsible Person"},
        name: "person_responsible",
        editorType: "dxSelectBox",
        dataField: "person_responsible",
        editorOptions: {
          items: that.groupmembers,
          displayExpr: "member",
          valueExpr: "member"
        },
        validationRules:[{type:"required"}]
      }, 
      {
        dataField: "startDate",
        editorType: "dxDateBox",
        editorOptions: {
            width: "100%",
            type: "datetime",
            onValueChanged: function(args) {
                startDate = args.value;
                form.getEditor("endDate") .option("value", new Date (startDate.getTime() + 30));
            }
        },
        validationRules:[{type:"required"}]
      }, 
      {
        name: "endDate",
        dataField: "endDate",
        editorType: "dxDateBox",
        editorOptions: {width: "100%",type: "datetime"},
        validationRules:[{type:"required"}]
      },
      {
        label: {text: "Mail Ids"},
        editorType: "dxTagBox",//"dxDropDownBox",
        dataField: "mailids",
        editorOptions: {
          items: that.groupmembers,
          displayExpr: "member",
          valueExpr: "member"
          
          // onValueChanged:function(args)
          // {
          //   console.log(args);
          // }
          //contentTemplate:"myTemplate"
          
        },
        validationRules:[{type:"required"}]
      }
   ]);
  }

  onAppointmentAdded (e) 
  {
    let newTask = 
    {
      endDate : e.appointmentData.endDate,
      mailids :[], 
      person_responsible : e.appointmentData.person_responsible, 
      startDate: e.appointmentData.startDate,
      text : e.appointmentData.text,
      userid : this.loginToken.id,
      _id:''
    };
    e.appointmentData.mailids.forEach(element => {
      newTask.mailids.push({'member':element})
    });
    //console.log(newTask);

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
  onAppointmentDeleted (e) 
  {
    //console.log(e);
    this.dataService.deleteTask('http://localhost:8083/api/tasks/'+e.appointmentData._id)
      .subscribe(resp=>{  
        alert(resp);
        this.getTasks() ;
    });
  }
}

