import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PatientService, Patient } from '../../services/patient.service';
import { DoctorService, Doctor } from '../../services/doctor.service';
import { AppointmentService, Appointment } from '../../services/appointment.service';
import { BillingService, Billing } from '../../services/billing.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  totalPatients = 0;
  admittedPatients = 0;
  outpatients = 0;
  dischargedPatients = 0;

  totalDoctors = 0;
  availableDoctors = 0;

  totalAppointments = 0;
  scheduledAppointments = 0;
  completedAppointments = 0;
  recentAppointments: Appointment[] = [];

  totalRevenue = 0;
  pendingBills = 0;

  isLoading = true;

  constructor(
    private patientService: PatientService,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private billingService: BillingService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Load patients
    this.patientService.getAll().subscribe({
      next: (patients) => {
        this.totalPatients = patients.length;
        this.admittedPatients = patients.filter(p => p.admissionStatus === 'Admitted').length;
        this.outpatients = patients.filter(p => p.admissionStatus === 'Outpatient').length;
        this.dischargedPatients = patients.filter(p => p.admissionStatus === 'Discharged').length;
        this.checkLoadingState();
      },
      error: (err) => {
        console.error('Error loading patients', err);
        this.checkLoadingState();
      }
    });

    // Load doctors
    this.doctorService.getAll().subscribe({
      next: (doctors) => {
        this.totalDoctors = doctors.length;
        this.availableDoctors = doctors.filter(d => d.availabilityStatus === 'Available').length;
        this.checkLoadingState();
      },
      error: (err) => {
        console.error('Error loading doctors', err);
        this.checkLoadingState();
      }
    });

    // Load appointments
    this.appointmentService.getAll().subscribe({
      next: (appointments) => {
        this.totalAppointments = appointments.length;
        this.scheduledAppointments = appointments.filter(a => a.status === 'Scheduled').length;
        this.completedAppointments = appointments.filter(a => a.status === 'Completed').length;
        
        // Sort by date desc and take top 5
        this.recentAppointments = [...appointments]
          .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
          .slice(0, 5);
        this.checkLoadingState();
      },
      error: (err) => {
        console.error('Error loading appointments', err);
        this.checkLoadingState();
      }
    });

    // Load billing
    this.billingService.getAll().subscribe({
      next: (billings) => {
        this.totalRevenue = billings
          .filter(b => b.paymentStatus === 'Paid')
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        this.pendingBills = billings
          .filter(b => b.paymentStatus === 'Pending')
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        this.checkLoadingState();
      },
      error: (err) => {
        console.error('Error loading billing', err);
        this.checkLoadingState();
      }
    });
  }

  private checkLoadingState(): void {
    // Basic fallback to end loading
    this.isLoading = false;
  }
}
