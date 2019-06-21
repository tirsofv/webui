import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { FieldConfig } from '../../../../common/entity/entity-form/models/field-config.interface';
import { AppLoaderService } from '../../../../../services/app-loader/app-loader.service';
import { EntityUtils } from '../../../../common/entity/utils';
import { WebSocketService, IscsiService } from '../../../../../services/';
import { helptext_sharing_iscsi } from 'app/helptext/sharing';
import * as _ from 'lodash';
import { EntityFormService } from '../../../../common/entity/entity-form/services/entity-form.service';

@Component({
  selector : 'app-iscsi-initiator-form',
  template : `<entity-form [conf]="this"></entity-form>`,
  providers: [IscsiService, EntityFormService]
})
export class InitiatorFormComponent {

  protected addCall: string = 'iscsi.initiator.create';
  protected queryCall: string = 'iscsi.initiator.query';
  protected editCall = 'iscsi.initiator.update';
  protected customFilter: Array<any> = [[["id", "="]]];
  protected route_success: string[] = [ 'sharing', 'iscsi', 'initiator' ];
  protected isEntity: boolean = true;
  protected pk: any;
  protected entityForm: any;

  protected fieldConfig: FieldConfig[] = [
    {
      type: 'list',
      name: 'initiators',
      placeholder: helptext_sharing_iscsi.initiator_form_placeholder_initiators,
      tooltip: helptext_sharing_iscsi.initiator_form_tooltip_initiators,
      templateListField: [
        {
          type: 'combobox',
          name: 'initiator',
          placeholder: helptext_sharing_iscsi.initiator_form_placeholder_initiators,
          tooltip: helptext_sharing_iscsi.initiator_form_tooltip_initiators,
          options: [],
          searchOptions: [],
        },
      ],
      listFields: []
    },
    {
      type : 'input',
      name : 'auth_network',
      placeholder : helptext_sharing_iscsi.initiator_form_placeholder_auth_network,
      tooltip: helptext_sharing_iscsi.initiator_form_tooltip_auth_network,
      value: '',
      inputType : 'textarea',
    },
    {
      type : 'input',
      name : 'comment',
      placeholder : helptext_sharing_iscsi.initiator_form_placeholder_comment,
      tooltip: helptext_sharing_iscsi.initiator_form_tooltip_comment,
    },
  ];

  constructor(
    protected router: Router,
    protected aroute: ActivatedRoute,
    protected loader: AppLoaderService,
    protected ws: WebSocketService,
    protected iscsiService: IscsiService,
    protected entityFormService: EntityFormService) {
      const initiatorField = _.find(this.fieldConfig, {name: 'initiators'}).templateListField[0];
      this.iscsiService.getGlobalSessions().subscribe((res)=> {
        for (let i = 0; i < res.length; i++) {
          if (_.find(initiatorField.options, {value: res[i].initiator}) === undefined) {
            initiatorField.options.push({
              label: res[i].initiator,
              value: res[i].initiator
            })
          }
        }
      });
  }

  preInit() {
    this.aroute.params.subscribe(params => {
      if (params['pk']) {
        this.pk = params['pk'];
        this.customFilter[0][0].push(parseInt(params['pk']));
      }
    });
  }

  afterInit(entityForm) {
    this.entityForm = entityForm;
  }

  resourceTransformIncomingRestData(data) {
    data['initiators'] = data['initiators'].length === 0 ? ['ALL'] : data['initiators'];
    data['auth_network'] = data['auth_network'].length === 0 ? 'ALL' : data['auth_network'].join(' ');
    return data;
  }

  beforeSubmit(data) {
    data.initiators = data.initiators.reduce(function(initiators, curr) {
      if (_.indexOf(initiators, curr.initiator) === -1 && curr.initiator != null && curr.initiator != 'ALL') {
        initiators.push(curr.initiator);
      }
      return initiators;
    }, []);
    data.auth_network = (data.auth_network === '' || data.auth_network === 'ALL') ? [] : data.auth_network.split(' ');
  }

  customEditCall(value) {
    this.loader.open();
    this.ws.call(this.editCall, [this.pk, value]).subscribe(
      (res) => {
        this.loader.close();
        this.router.navigate(new Array('/').concat(this.route_success));
      },
      (err) => {
        this.loader.close();
        new EntityUtils().handleWSError(this.entityForm, err);
      }
    );
  }

  dataHandler(entity) {
    if (typeof entity.wsResponseIdx === 'object') {
      for (let i = 0; i < entity.wsResponseIdx.length; i++) {
        const templateListField = _.cloneDeep(_.find(this.fieldConfig, {'name': 'initiators'}).templateListField);
        entity.wsfg.push(this.entityFormService.createFormGroup(templateListField));
        _.find(this.fieldConfig, {'name': 'initiators'}).listFields.push(templateListField);
        entity.wsfg.controls[i].controls['initiator'].setValue(entity.wsResponseIdx[i]);
      }
    } else {
      entity.wsfg.setValue(entity.wsResponseIdx);
    }
  }
}
