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
  protected isBasicMode = true;
  protected advanced_field: Array<any> = [
    'http_port_listen_backlog',
    'additional_params',
  ];
  public custActions: Array<any> = [
    {
      id : 'basic_mode',
      name : T('Basic Mode'),
      function : () => { this.isBasicMode = !this.isBasicMode; }
    },
    {
      'id' : 'advanced_mode',
      name : T('Advanced Mode'),
      function : () => { this.isBasicMode = !this.isBasicMode; }
    }
  ];
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
      type : 'input',
      name : 'http_port_listen_backlog',
      placeholder : T('Http port listen backlog'),
      tooltip: T('The port backlog'),
      inputType: 'number',
      validation: [Validators.required, regexValidator(
        /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/
        )]
    },
    {
      type : 'select',
      name : 'bind',
      placeholder : T('Bind to'),
      tooltip: T('A list of IP address to bind netdata service to'),
      options:[
        {label:'0.0.0.0', value: '0.0.0.0'},
        {label:'::', value: '::'}
      ]
    },
    {
      type : 'input',
      name : 'port',
      placeholder : T('Bind to Port'),
      tooltip: T('The port which will be used with selected bind to IP addresses'),
      required: true,
      value: 19999,
      inputType: 'number',
      validation: [Validators.required, regexValidator(
        /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/
        )]
    },
    {
      type : 'textarea',
      name : 'additional_params',
      placeholder : T('Additional Parameters'),
      tooltip: T(`Define other sections and their respective key, 
                  value pairs if any. The following format should be followed
                  [Section name] key=value
                  An example is,
                    [system.intr]
                    history = 86400
                    enabled = yes`
                    ),
    },
  ];
  protected storage_path: any;
  protected storage_path_subscription: any;

  constructor(protected router: Router, protected route: ActivatedRoute,
               protected ws: WebSocketService,
              protected systemGeneralService: SystemGeneralService, private dialog:DialogService ) {}

  isCustActionVisible(actionId: string) {
    if (actionId === 'advanced_mode' && this.isBasicMode === false) {
      return false;
    } else if (actionId === 'basic_mode' && this.isBasicMode === true) {
      return false;
    }
    return true;
  }
  async afterInit(entityForm: any) {
    this.systemGeneralService.getIPChoices().subscribe((res) => {
      res.forEach((item) => {
        _.find(this.fieldConfig,{'name':'bind'}).options.push({label : item[1], value : item[0]});
      });
    });

    await entityForm.ws.call('netdata.config').subscribe((res)=>{
      const bind = res.bind[0];
      entityForm.formGroup.controls['bind'].setValue(bind);
    });
    entityForm.submitFunction = this.submitFunction;
  };

  resourceTransformIncomingRestData(data) {
    return data;
  };

  submitFunction(this: any, entityForm: any,){
    entityForm.bind = [ entityForm.bind];
    return this.ws.call('netdata.update', [entityForm]);
  };

  afterSave(entityForm) {
    this.ws.call('service.query', [[]]).subscribe((res) => {
      const service = _.find(res, {"service": "netdata"});
      if (service['enable']) {
        this.router.navigate(new Array('/').concat(
          this.route_success));
      } else {
          this.dialog.confirm(T("Enable service"),
          T("Enable this service?"),
          true, T("Enable Service")).subscribe((dialogRes) => {
            if (dialogRes) {
              entityForm.loader.open();
              this.ws.call('service.update', [service['id'], { enable: true }]).subscribe((updateRes) => {
                this.ws.call('service.start', [service.service]).subscribe((startRes) => {
                  entityForm.loader.close();
                  entityForm.snackBar.open(T("Service started"), T("close"));
                  this.router.navigate(new Array('/').concat(
                   this.route_success));
                }, (err) => {
                  entityForm.loader.close();
                  this.dialog.errorReport(err.error, err.reason, err.trace.formatted);
                  this.router.navigate(new Array('/').concat(
                    this.route_success));
                });
               }, (err) => {
                entityForm.loader.close();
                this.dialog.errorReport(err.error, err.reason, err.trace.formatted);
                this.router.navigate(new Array('/').concat(
                  this.route_success));
               });
           } else {
            this.router.navigate(new Array('/').concat(
              this.route_success));
            }
        });
      }

    });
  }
}
