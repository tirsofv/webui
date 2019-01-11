import {Component} from '@angular/core';

@Component({
  selector : 'app-ntpserver-list',
  template: `<entity-table [title]="title" [conf]="this"></entity-table>`
})
export class NTPServerListComponent {

  public title = "NTP Servers";
  protected resource_name: string = 'system/ntpserver';
  protected route_add: string[] = [ 'system', 'ntpservers', 'add' ];
  protected route_add_tooltip = "Add NTP Server";
  protected route_edit: string[] = [ 'system', 'ntpservers', 'edit' ];
  protected route_delete: string[] = [ 'system', 'ntpservers', 'delete' ];
  protected route_success: string[] = [ 'system', 'ntpservers' ];
  
  public columns: Array<any> = [
    {name : 'Address', prop : 'ntp_address', always_display: true, flex: 1},
    {name : 'Burst', prop : 'ntp_burst', flex: 0},
    {name : 'IBurst', prop : 'ntp_iburst', flex: 0},
    {name : 'Prefer', prop : 'ntp_prefer', flex: 0},
    {name : 'Min. Poll', prop : 'ntp_minpoll', flex: 0},
    {name : 'Max. Poll', prop : 'ntp_maxpoll', flex: 0},
  ];
  public config: any = {
    paging : true,
    sorting : {columns : this.columns},
    deleteMsg: {
      title: 'NTP Server',
      key_props: ['ntp_address']
    },
  };
}
