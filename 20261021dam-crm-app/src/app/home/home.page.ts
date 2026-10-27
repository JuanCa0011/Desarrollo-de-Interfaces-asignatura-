import { Component, OnInit, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonItem, IonItemSliding, IonList } from '@ionic/angular';
import { SupabaseService } from '../services/supabase';
import { ProveedorModels } from '../models/proveedor.models';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonItem, IonItemSliding, IonList],
})
export class HomePage implements OnInit{

  private supabaseService = inject(SupabaseService);
  proveedores:ProveedorModels[]=[];

  constructor() {}
  async ngOnInit() {
    this.proveedores=await this.supabaseService.getProveedores();
  }
}