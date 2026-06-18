import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Billing {
  id?: number;
  patientId: number;
  patientName?: string;
  appointmentId?: number;
  consultingFee: number;
  roomCharges: number;
  treatmentCharges: number;
  totalAmount?: number;
  paymentStatus?: string;
  billDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private apiUrl = `${environment.apiUrl}/billings`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Billing[]> {
    return this.http.get<Billing[]>(this.apiUrl);
  }

  getById(id: number): Observable<Billing> {
    return this.http.get<Billing>(`${this.apiUrl}/${id}`);
  }

  create(billing: Billing): Observable<Billing> {
    return this.http.post<Billing>(this.apiUrl, billing);
  }

  pay(id: number): Observable<Billing> {
    return this.http.put<Billing>(`${this.apiUrl}/${id}/pay`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
