package com.hospital.management.controller;

import com.hospital.management.model.Billing;
import com.hospital.management.model.Patient;
import com.hospital.management.repository.BillingRepository;
import com.hospital.management.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/billings")
@CrossOrigin(origins = "*")
@SuppressWarnings("null")
public class BillingController {

    @Autowired
    private BillingRepository billingRepository;

    @Autowired
    private PatientRepository patientRepository;

    @GetMapping
    public List<Billing> getAllBillings() {
        return billingRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Billing> getBillingById(@PathVariable Long id) {
        return billingRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createBilling(@RequestBody Billing billing) {
        if (billing.getPatientId() != null) {
            Patient p = patientRepository.findById(billing.getPatientId()).orElse(null);
            if (p != null) {
                billing.setPatientName(p.getName());
            } else {
                return ResponseEntity.badRequest().body("Error: Patient not found");
            }
        } else {
            return ResponseEntity.badRequest().body("Error: Patient ID is required");
        }

        double total = billing.getConsultingFee() + billing.getRoomCharges() + billing.getTreatmentCharges();
        billing.setTotalAmount(total);

        if (billing.getPaymentStatus() == null || billing.getPaymentStatus().isEmpty()) {
            billing.setPaymentStatus("Pending");
        }

        if (billing.getBillDate() == null) {
            billing.setBillDate(LocalDate.now());
        }

        return ResponseEntity.ok(billingRepository.save(billing));
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<Billing> payBill(@PathVariable Long id) {
        return billingRepository.findById(id)
                .map(billing -> {
                    billing.setPaymentStatus("Paid");
                    return ResponseEntity.ok(billingRepository.save(billing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBilling(@PathVariable Long id) {
        return billingRepository.findById(id)
                .map(billing -> {
                    billingRepository.delete(billing);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
