import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';

@Component({
  selector: 'app-netdata',
  templateUrl: './netdata.component.html',
})
export class ServiceNetdataComponent implements OnInit {

  @ViewChild('tabGroup') tabGroup;

  public activedTab = 'settings';
  public navLinks: Array < any > = [{
      label: 'Global Settings',
      path: 'settings',
    },
    {
      label: 'Alarm',
      path: 'alarm',
    },
    {
      label: 'Streaming',
      path: 'streaming',
    },

  ];
  constructor(protected router: Router, protected aroute: ActivatedRoute, ) {}

  ngOnInit() {
    this.aroute.params.subscribe(params => {
      this.activedTab = params['pk'];
    });
  }

}
