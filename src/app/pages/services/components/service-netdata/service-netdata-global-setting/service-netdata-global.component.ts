import { Component, OnDestroy } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import {  DialogService } from '../../../../../services';
import { regexValidator } from '../../../../common/entity/entity-form/validators/regex-validation';

import { SystemGeneralService,WebSocketService} from '../../../../../services';
import { FieldConfig} from '../../../../common/entity/entity-form/models/field-config.interface';
import { T } from '../../../../../translate-marker';

@Component({
  selector : 'netdata-global-settings',
  template : `<entity-form [conf]="this"></entity-form>`,
  providers : [ SystemGeneralService ]
})

export class ServiceNetDataGlobalSettingComponent {
  protected queryCall = 'netdata.config';
  protected addCall = 'netdata.update';
  protected route_success: string[] = [ 'services' ];


  public fieldConfig: FieldConfig[] = [
    {
      type : 'input',
      name : 'history',
      placeholder : T('History'),
      tooltip: T('The number of entries the netdata daemon will by default keep in memory for each chart dimension.'),
      value: '90000',
      inputType: 'number'
    },
    {
      type : 'input',
      name : 'update_every',
      placeholder : T('Update every'),
      tooltip: T('The frequency in seconds, for data collection'),
      inputType: 'number'
    },
    {
      type : 'select',
      name : 'bind',
      placeholder : T('Bind to'),
      tooltip: T('A list of IP address to bind netdata service to'),
      options:[
        {label:'*', value: '*'}
      ]
    },
    {
      type : 'input',
      name : 'port',
      placeholder : T('Bind to'),
      tooltip: T('The port which will be used with selected bind to IP addresses'),
      required: true,
      value: 19999,
      inputType: 'number',
      validation: [Validators.required, regexValidator(
        /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/
        )]
    },
  ];
  protected storage_path: any;
  protected storage_path_subscription: any;

  constructor(protected router: Router, protected route: ActivatedRoute,
               protected ws: WebSocketService,
              protected systemGeneralService: SystemGeneralService, private dialog:DialogService ) {}


  afterInit(entityForm: any) {
    this.systemGeneralService.getIPChoices().subscribe((res) => {
      res.forEach((item) => {
        _.find(this.fieldConfig,{'name':'bind'}).options.push({label : item[1], value : item[0]});
      });
    });

    entityForm.ws.call('netdata.config').subscribe((res)=>{
    })
    entityForm.submitFunction = this.submitFunction;

  }

  clean(value) {
    value.bind = [value.bind]
    return value;
  }

  resourceTransformIncomingRestData(data) {
  }

  submitFunction(this: any, entityForm: any,){

    return this.ws.call('netdata.update', [entityForm]);

  }
}
