import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService, Appointment } from '../../services/appointment.service';
import { PatientService, Patient } from '../../services/patient.service';
import { DoctorService, Doctor } from '../../services/doctor.service';

@Component({
  selector: 'app-appointments',
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.html',
  styleUrl: './appointments.css'
})
export class AppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  patients: Patient[] = [];
  doctors: Doctor[] = [];

  // Filter bindings
  statusFilter = '';
  searchQuery = '';

  // Form modals
  showBookModal = false;
  showStatusModal = false;

  // Book appointment form bindings
  newAppointment: Appointment = this.getEmptyAppointment();

  // Status/Prescription update form bindings
  selectedAppointment?: Appointment;
  statusUpdate = 'Scheduled';
  prescriptionUpdate = '';

  // Time slots for booking
  timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private doctorService: DoctorService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.loadPatients();
    this.loadDoctors();
  }

  loadAppointments(): void {
    this.appointmentService.getAll().subscribe({
      next: (data) => {
        this.appointments = data;
        this.applyFilters();
      },
      error: (err) => console.error('Error loading appointments', err)
    });
  }

  loadPatients(): void {
    this.patientService.getAll().subscribe({
      next: (data) => this.patients = data,
      error: (err) => console.error('Error loading patients', err)
    });
  }

  loadDoctors(): void {
    this.doctorService.getAll().subscribe({
      next: (data) => this.doctors = data.filter(d => d.availabilityStatus === 'Available' || d.availabilityStatus === 'In Surgery'),
      error: (err) => console.error('Error loading doctors', err)
    });
  }

  applyFilters(): void {
    this.filteredAppointments = this.appointments.filter(a => {
      const patientName = a.patientName ? a.patientName.toLowerCase() : '';
      const doctorName = a.doctorName ? a.doctorName.toLowerCase() : '';
      const matchesSearch = patientName.includes(this.searchQuery.toLowerCase()) || 
                            doctorName.includes(this.searchQuery.toLowerCase());
      
      const matchesStatus = this.statusFilter === '' || a.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  openBookModal(): void {
    this.newAppointment = this.getEmptyAppointment();
    this.showBookModal = true;
  }

  closeBookModal(): void {
    this.showBookModal = false;
  }

  openStatusModal(appointment: Appointment): void {
    this.selectedAppointment = appointment;
    this.statusUpdate = appointment.status || 'Scheduled';
    this.prescriptionUpdate = appointment.prescription || '';
    this.showStatusModal = true;
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
  }

  bookAppointment(): void {
    if (!this.newAppointment.patientId || !this.newAppointment.doctorId || !this.newAppointment.appointmentDate || !this.newAppointment.timeSlot) {
      alert('Please fill in all required fields.');
      return;
    }

    this.appointmentService.create(this.newAppointment).subscribe({
      next: () => {
        this.loadAppointments();
        this.closeBookModal();
      },
      error: (err) => alert(err.error || 'Failed to book appointment')
    });
  }

  saveStatusUpdate(): void {
    if (!this.selectedAppointment || !this.selectedAppointment.id) return;

    const updated = {
      ...this.selectedAppointment,
      status: this.statusUpdate,
      prescription: this.prescriptionUpdate
    };

    this.appointmentService.update(this.selectedAppointment.id, updated).subscribe({
      next: () => {
        this.loadAppointments();
        this.closeStatusModal();
      },
      error: (err) => console.error('Error updating status', err)
    });
  }

  deleteAppointment(id?: number): void {
    if (!id) return;
    if (confirm('Are you sure you want to cancel and delete this appointment schedule?')) {
      this.appointmentService.delete(id).subscribe({
        next: () => this.loadAppointments(),
        error: (err) => console.error('Error deleting appointment', err)
      });
    }
  }

  private getEmptyAppointment(): Appointment {
    return {
      patientId: 0,
      doctorId: 0,
      appointmentDate: new Date().toISOString().substring(0, 10),
      timeSlot: '10:00 AM',
      status: 'Scheduled',
      prescription: ''
    };
  }
}
