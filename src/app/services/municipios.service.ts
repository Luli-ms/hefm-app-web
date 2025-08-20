import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Municipios {
  private municipios: string[] = [
    'Las Palmas',
    'Telde',
    'Ingenio',
    'Agüimes',
    'Santa Lucía de Tirajana',
    'San Bartolomé de Tirajana',
    'Mogán'
  ];

  getMunicipios(): string[] {
    return this.municipios;
  }
}
