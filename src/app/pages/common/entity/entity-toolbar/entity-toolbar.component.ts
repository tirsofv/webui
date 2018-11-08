import { Component, OnInit } from '@angular/core';

@Component({
  selector:'entity-toolbar',
  //template:`<h4>Entity-Toolbar template</h4>`,
  templateUrl:'./entity-toolbar.component.html',
  styleUrls:['./entity-toolbar.component.css']
})
export class EntityToolbarComponent implements OnInit{

  orientation?: string = 'horizontal';

  constructor(){}

  ngOnInit(){}
}
