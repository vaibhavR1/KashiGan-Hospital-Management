import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingService, Billing } from '../../services/billing.service';
import { PatientService, Patient } from '../../services/patient.service';

@Component({
  selector: 'app-billing',
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.html',
  styleUrl: './billing.css'
})
export class BillingComponent implements OnInit {
  billings: Billing[] = [];
  filteredBillings: Billing[] = [];
  patients: Patient[] = [];

  // Filters
  statusFilter = '';
  searchQuery = '';

  // Modals
  showCreateModal = false;
  showReceiptModal = false;

  // Create Bill Bindings
  newBill: Billing = this.getEmptyBill();

  // Receipt Modal Bindings
  selectedBill?: Billing;

  constructor(
    private billingService: BillingService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.loadBillings();
    this.loadPatients();
  }

  loadBillings(): void {
    this.billingService.getAll().subscribe({
      next: (data) => {
        this.billings = data;
        this.applyFilters();
      },
      error: (err) => console.error('Error loading billing records', err)
    });
  }

  loadPatients(): void {
    this.patientService.getAll().subscribe({
      next: (data) => this.patients = data,
      error: (err) => console.error('Error loading patients', err)
    });
  }

  applyFilters(): void {
    this.filteredBillings = this.billings.filter(b => {
      const patientName = b.patientName ? b.patientName.toLowerCase() : '';
      const matchesSearch = patientName.includes(this.searchQuery.toLowerCase()) || 
                            b.patientId.toString().includes(this.searchQuery);
      const matchesStatus = this.statusFilter === '' || b.paymentStatus === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  openCreateModal(): void {
    this.newBill = this.getEmptyBill();
    this.loadPatients();
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  openReceiptModal(bill: Billing): void {
    this.selectedBill = bill;
    this.showReceiptModal = true;
  }

  closeReceiptModal(): void {
    this.showReceiptModal = false;
  }

  createBill(): void {
    if (!this.newBill.patientId || this.newBill.consultingFee < 0 || this.newBill.roomCharges < 0 || this.newBill.treatmentCharges < 0) {
      alert('Please select a patient and fill in valid charges.');
      return;
    }

    this.billingService.create(this.newBill).subscribe({
      next: () => {
        this.loadBillings();
        this.closeCreateModal();
      },
      error: (err) => alert(err.error || 'Failed to generate invoice')
    });
  }

  processPayment(bill: Billing): void {
    if (!bill.id) return;
    if (confirm(`Confirm payment of ₹${bill.totalAmount} for patient ${bill.patientName}?`)) {
      this.billingService.pay(bill.id).subscribe({
        next: () => this.loadBillings(),
        error: (err) => console.error('Error processing payment', err)
      });
    }
  }

  deleteBill(id?: number): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this invoice record?')) {
      this.billingService.delete(id).subscribe({
        next: () => this.loadBillings(),
        error: (err) => console.error('Error deleting invoice', err)
      });
    }
  }

  printReceipt(): void {
    window.print();
  }

  private getEmptyBill(): Billing {
    return {
      patientId: 0,
      consultingFee: 0,
      roomCharges: 0,
      treatmentCharges: 0,
      paymentStatus: 'Pending'
    };
  }
}
