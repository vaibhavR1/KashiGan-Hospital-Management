import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { PatientsComponent } from './components/patients/patients';
import { DoctorsComponent } from './components/doctors/doctors';
import { AppointmentsComponent } from './components/appointments/appointments';
import { BillingComponent } from './components/billing/billing';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'patients', component: PatientsComponent },
  { path: 'doctors', component: DoctorsComponent },
  { path: 'appointments', component: AppointmentsComponent },
  { path: 'billing', component: BillingComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];
