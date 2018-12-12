
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import {  DialogService } from '../../../../../services';
import { SystemGeneralService,WebSocketService} from '../../../../../services';
import { FieldConfig} from '../../../../common/entity/entity-form/models/field-config.interface';
import { T } from '../../../../../translate-marker';

@Component({
  selector : 'netdata-alarm',
  template : `<entity-form [conf]="this"></entity-form>`,
  providers : [ SystemGeneralService ]
})

export class ServiceNetDataAlarmComponent {
  protected queryCall = 'netdata.config';
  protected addCall = 'netdata.update';
  protected route_success: string[] = [ 'services' ];
  public fieldConfig: FieldConfig[] = [
  ];
  
  constructor(protected router: Router, protected route: ActivatedRoute,
               protected ws: WebSocketService,
              protected systemGeneralService: SystemGeneralService, private dialog:DialogService ) {}
  

  preInit(entityForm: any){
    this.systemGeneralService.getNetdataList().subscribe((res)=>{
      let i = 0
      for (const alarm in res.alarms) {
          this.fieldConfig[i] = {
            type : 'checkbox',
            name : alarm,
            placeholder : T(alarm),
            value : res.alarms[alarm].enabled,
          };
          i++
        };
        
    });
  };
  
  async afterInit(entityForm: any) {
    entityForm.submitFunction = this.submitFunction;
  };

  submitFunction(this: any, entityForm: any,){
    return this.ws.call('netdata.update', [entityForm]);
  };


}
