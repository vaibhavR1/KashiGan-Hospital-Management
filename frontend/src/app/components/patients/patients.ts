import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService, Patient } from '../../services/patient.service';

@Component({
  selector: 'app-patients',
  imports: [CommonModule, FormsModule],
  templateUrl: './patients.html',
  styleUrl: './patients.css'
})
export class PatientsComponent implements OnInit, OnDestroy {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  searchQuery = '';
  statusFilter = '';
  currentTime = '';
  private clockInterval: any;

  // Form handling
  showModal = false;
  isEditMode = false;
  currentPatientId?: number;

  formPatient: Patient = this.getEmptyPatient();

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadPatients();
    this.startClock();
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  startClock(): void {
    this.updateTime();
    this.clockInterval = setInterval(() => this.updateTime(), 1000);
  }

  updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) + ' ' + now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  loadPatients(): void {
    this.patientService.getAll().subscribe({
      next: (data) => {
        this.patients = data;
        this.applyFilters();
      },
      error: (err) => console.error('Error loading patients', err)
    });
  }

  applyFilters(): void {
    this.filteredPatients = this.patients.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            p.contactNumber.includes(this.searchQuery) ||
                            (p.medicalHistory && p.medicalHistory.toLowerCase().includes(this.searchQuery.toLowerCase()));
      
      const matchesStatus = this.statusFilter === '' || p.admissionStatus === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentPatientId = undefined;
    this.formPatient = this.getEmptyPatient();
    this.showModal = true;
  }

  openEditModal(patient: Patient): void {
    this.isEditMode = true;
    this.currentPatientId = patient.id;
    // Clone patient
    this.formPatient = { ...patient };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  savePatient(): void {
    if (!this.formPatient.name || !this.formPatient.age || !this.formPatient.gender || !this.formPatient.contactNumber) {
      alert('Please fill in all required fields.');
      return;
    }

    // Format dateOfAdmission to include the current time if it's a simple date
    const now = new Date();
    if (this.formPatient.dateOfAdmission) {
      if (this.formPatient.dateOfAdmission.length === 10) { // YYYY-MM-DD
        const timePart = now.toTimeString().split(' ')[0]; // HH:MM:SS
        this.formPatient.dateOfAdmission = `${this.formPatient.dateOfAdmission}T${timePart}`;
      }
    } else {
      this.formPatient.dateOfAdmission = now.toISOString();
    }

    if (this.isEditMode && this.currentPatientId !== undefined) {
      this.patientService.update(this.currentPatientId, this.formPatient).subscribe({
        next: () => {
          this.loadPatients();
          this.closeModal();
        },
        error: (err) => console.error('Error updating patient', err)
      });
    } else {
      this.patientService.create(this.formPatient).subscribe({
        next: () => {
          this.loadPatients();
          this.closeModal();
        },
        error: (err) => console.error('Error creating patient', err)
      });
    }
  }

  deletePatient(id?: number): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this patient profile?')) {
      this.patientService.delete(id).subscribe({
        next: () => this.loadPatients(),
        error: (err) => console.error('Error deleting patient', err)
      });
    }
  }

  exportToExcel(): void {
    if (this.filteredPatients.length === 0) {
      alert('No data available to export.');
      return;
    }

    const headers = ['Patient ID', 'Full Name', 'Age', 'Gender', 'Contact Number', 'Admission Date/Time', 'Admission Status', 'Medical History'];
    
    const csvContent = [
      headers.join(','),
      ...this.filteredPatients.map(p => {
        const id = p.id || '';
        const name = `"${p.name.replace(/"/g, '""')}"`;
        const age = p.age;
        const gender = `"${p.gender}"`;
        const contact = `"${p.contactNumber}"`;
        const admission = p.dateOfAdmission ? `"${new Date(p.dateOfAdmission).toLocaleString()}"` : '""';
        const status = `"${p.admissionStatus}"`;
        const history = p.medicalHistory ? `"${p.medicalHistory.replace(/"/g, '""')}"` : '""';
        
        return [id, name, age, gender, contact, admission, status, history].join(',');
      })
    ].join('\r\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Patients_Registry_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private getEmptyPatient(): Patient {
    return {
      name: '',
      age: 0,
      gender: 'Male',
      contactNumber: '',
      admissionStatus: 'Outpatient',
      dateOfAdmission: new Date().toISOString().substring(0, 10),
      medicalHistory: ''
    };
  }
}
