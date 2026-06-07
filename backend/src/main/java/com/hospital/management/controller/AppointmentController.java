package com.hospital.management.controller;

import com.hospital.management.model.Appointment;
import com.hospital.management.model.Patient;
import com.hospital.management.model.Doctor;
import com.hospital.management.repository.AppointmentRepository;
import com.hospital.management.repository.PatientRepository;
import com.hospital.management.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:4200")
@SuppressWarnings("null")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id) {
        return appointmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody Appointment appointment) {
        // Retrieve patient name
        if (appointment.getPatientId() != null) {
            Patient p = patientRepository.findById(appointment.getPatientId()).orElse(null);
            if (p != null) {
                appointment.setPatientName(p.getName());
            } else {
                return ResponseEntity.badRequest().body("Error: Patient not found");
            }
        }
        
        // Retrieve doctor name
        if (appointment.getDoctorId() != null) {
            Doctor d = doctorRepository.findById(appointment.getDoctorId()).orElse(null);
            if (d != null) {
                appointment.setDoctorName(d.getName());
            } else {
                return ResponseEntity.badRequest().body("Error: Doctor not found");
            }
        }

        if (appointment.getStatus() == null || appointment.getStatus().isEmpty()) {
            appointment.setStatus("Scheduled");
        }

        return ResponseEntity.ok(appointmentRepository.save(appointment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable Long id, @RequestBody Appointment appointmentDetails) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointment.setStatus(appointmentDetails.getStatus());
                    appointment.setPrescription(appointmentDetails.getPrescription());
                    if (appointmentDetails.getAppointmentDate() != null) {
                        appointment.setAppointmentDate(appointmentDetails.getAppointmentDate());
                    }
                    if (appointmentDetails.getTimeSlot() != null) {
                        appointment.setTimeSlot(appointmentDetails.getTimeSlot());
                    }
                    return ResponseEntity.ok(appointmentRepository.save(appointment));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointmentRepository.delete(appointment);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
