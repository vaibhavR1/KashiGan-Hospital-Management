import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService, Doctor } from '../../services/doctor.service';

@Component({
  selector: 'app-doctors',
  imports: [CommonModule, FormsModule],
  templateUrl: './doctors.html',
  styleUrl: './doctors.css'
})
export class DoctorsComponent implements OnInit {
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  specializationFilter = '';
  statusFilter = '';

  // Specialization lists for quick reference
  specializations = [
    'Cardiology',
    'Neurology',
    'General Medicine',
    'Pediatrics',
    'Orthopedics',
    'Dermatology',
    'Oncology',
    'Gynaecology'
  ];

  // Form states
  showModal = false;
  isEditMode = false;
  currentDoctorId?: number;
  formDoctor: Doctor = this.getEmptyDoctor();

  constructor(private doctorService: DoctorService) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.doctorService.getAll().subscribe({
      next: (data) => {
        this.doctors = data;
        this.applyFilters();
      },
      error: (err) => console.error('Error loading doctors', err)
    });
  }

  applyFilters(): void {
    this.filteredDoctors = this.doctors.filter(d => {
      const matchesSpecialization = this.specializationFilter === '' || d.specialization === this.specializationFilter;
      const matchesStatus = this.statusFilter === '' || d.availabilityStatus === this.statusFilter;
      return matchesSpecialization && matchesStatus;
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentDoctorId = undefined;
    this.formDoctor = this.getEmptyDoctor();
    this.showModal = true;
  }

  openEditModal(doctor: Doctor): void {
    this.isEditMode = true;
    this.currentDoctorId = doctor.id;
    this.formDoctor = { ...doctor };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveDoctor(): void {
    if (!this.formDoctor.name || !this.formDoctor.specialization || !this.formDoctor.contactNumber) {
      alert('Please fill in all required fields.');
      return;
    }

    if (this.isEditMode && this.currentDoctorId !== undefined) {
      this.doctorService.update(this.currentDoctorId, this.formDoctor).subscribe({
        next: () => {
          this.loadDoctors();
          this.closeModal();
        },
        error: (err) => console.error('Error updating doctor', err)
      });
    } else {
      this.doctorService.create(this.formDoctor).subscribe({
        next: () => {
          this.loadDoctors();
          this.closeModal();
        },
        error: (err) => console.error('Error creating doctor', err)
      });
    }
  }

  deleteDoctor(id?: number): void {
    if (!id) return;
    if (confirm('Are you sure you want to remove this doctor profile?')) {
      this.doctorService.delete(id).subscribe({
        next: () => this.loadDoctors(),
        error: (err) => console.error('Error deleting doctor', err)
      });
    }
  }

  private getEmptyDoctor(): Doctor {
    return {
      name: '',
      specialization: 'General Medicine',
      contactNumber: '',
      availabilityStatus: 'Available'
    };
  }
}
