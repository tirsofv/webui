import { ApplicationRef, Component, Injector, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CoreEvent, CoreService } from 'app/core/services/core.service';
import { PreferencesService, UserPreferences } from 'app/core/services/preferences.service';
import { FieldConfig } from 'app/pages/common/entity/entity-form/models/field-config.interface';
import { FieldSet } from 'app/pages/common/entity/entity-form/models/fieldset.interface';
import { RestService, WebSocketService } from 'app/services/';
import { ThemeService } from 'app/services/theme/theme.service';
import { Subject } from 'rxjs';
import { T } from '../../../../translate-marker';

@Component({
  selector : 'general-preferences-form',
  template:`<entity-form-embedded fxFlex="100" fxFlex.gt-xs="300px" [target]="target" [data]="values" [conf]="this"></entity-form-embedded>`
})
export class GeneralPreferencesFormComponent implements OnInit, OnChanges, OnDestroy {
  public target: Subject<CoreEvent> = new Subject();
  public values = [];
  public saveSubmitText = "Update Settings";
  protected isEntity: boolean = true;
  private themeOptions: any[] = [];
  public fieldConfig:FieldConfig[] = [];
  public showTooltips:boolean = this.prefs.preferences.showTooltips;
  public allowPwToggle:boolean = this.prefs.preferences.allowPwToggle;;
  public enableWarning:boolean = this.prefs.preferences.enableWarning;
  public preferIconsOnly: boolean = this.prefs.preferences.preferIconsOnly;
  public tableListSize: number | null = this.prefs.preferences.tableListSize
  public fieldSetDisplay:string = 'no-margins';//default | carousel | stepper
    public fieldSets: FieldSet[] = [
      {
        name:'General Preferences',
        class:'preferences',
        label:true,
        width:'400px',
        config:[
          {
            type: 'select',
            name: 'userTheme',
            width:'300px',
            placeholder: 'Choose Theme',
            options: this.themeOptions,
            value:this.themeService.activeTheme,
            tooltip:'Choose a preferred theme.',
            class:'inline'
          },
          {
            type: 'checkbox',
            name: 'preferIconsOnly',
            width:'300px',
            placeholder: 'Prefer buttons with icons only',
            value:this.preferIconsOnly,
            tooltip: 'Preserve screen space with icons and tooltips instead of text labels.',
            class:'inline'
          },
          {
            type: 'checkbox',
            name: 'showTooltips',
            width: '300px',
            placeholder: 'Enable Help Text in Forms',
            value: this.showTooltips,
            tooltip: 'Display help icons in forms.',
            class:'inline'
          },
          {
            type: 'checkbox',
            name: 'allowPwToggle',
            width: '300px',
            placeholder: 'Enable Password Toggle',
            value:this.allowPwToggle,
            tooltip: 'This option enables/disables a password toggle button.',
            class:'inline'
          },
          {
            type: 'checkbox',
            name: 'enableWarning',
            width: '300px',
            placeholder: 'Enable "Save Configuration" Dialog Before Upgrade',
            value:this.enableWarning,
            tooltip: T('Show or hide a dialog to save the system\
                        configuration file. This dialog appears\
                        after choosing to upgrade the system.'),
            class:'inline'
          },
          {
            type: 'input',
            inputType: 'number',
            min: 1,
            name: 'tableListSize',
            validation: [Validators.min(1), Validators.pattern(/^-?\d+\d*$/g)],
            width: '300px',
            placeholder: 'Table list size',
            value: this.tableListSize,
            tooltip: T('The number of items to be displayed in data tables.'),
            class:'inline'
          }
        ]
      }
    ]

    constructor(
      protected router: Router,
      protected rest: RestService,
      protected ws: WebSocketService,
      protected _injector: Injector,
      protected _appRef: ApplicationRef,
      public themeService:ThemeService,
      public prefs:PreferencesService,
      private core:CoreService
    ) {}

    ngOnInit(){
      // Get current preferences so for form values
      this.init();
    }

    ngOnChanges(changes){
      if(changes.baseTheme){
        alert("baseTheme Changed!")
      }
    }

    ngOnDestroy(){
      this.core.unregister({observerClass:this});
    }

    beforeSubmit(preferences: { tableListSize: string | number }): void {
      if (preferences.tableListSize) {
        preferences.tableListSize = parseInt(preferences.tableListSize as string, 10);
      }
      if (typeof preferences.tableListSize === 'string') {
        preferences.tableListSize = null;
      }
    }

    init(){
      this.setThemeOptions();
      this.core.register({observerClass:this,eventName:"ThemeListsChanged"}).subscribe((evt:CoreEvent) => {
        this.setThemeOptions();
      });
      //this.setFavoriteFields();
      this.loadValues();
      this.target.subscribe((evt:CoreEvent) => {
        switch(evt.name){
        case "FormSubmitted":
          this.core.emit({name:"ChangePreferences",data:evt.data});
          break;
        case "CreateTheme":
          this.router.navigate(new Array('').concat(['ui-preferences', 'create-theme']));
          break;
        }
      });
      this.generateFieldConfig();
    }

     setThemeOptions(){
       this.themeOptions.splice(0,this.themeOptions.length);
       for(let i = 0; i < this.themeService.allThemes.length; i++){
         let theme = this.themeService.allThemes[i];
         this.themeOptions.push({label:theme.label, value: theme.name});
       }
     }

     processSubmission(obj:any){}

     loadValues(themeName?:string){
       this.enableWarning = this.prefs.preferences.enableWarning
       this.allowPwToggle = this.prefs.preferences.allowPwToggle
       this.showTooltips = this.prefs.preferences.showTooltips
       this.preferIconsOnly = this.prefs.preferences.preferIconsOnly;
     }

     generateFieldConfig(){
       for(let i in this.fieldSets){
         for(let ii in this.fieldSets[i].config){
           this.fieldConfig.push(this.fieldSets[i].config[ii]);
         }
       }
     }
}
