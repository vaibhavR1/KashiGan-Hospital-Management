package com.hospital.management.util;

import com.hospital.management.model.Appointment;
import com.hospital.management.model.Billing;
import com.hospital.management.model.Doctor;
import com.hospital.management.model.Patient;
import com.hospital.management.repository.AppointmentRepository;
import com.hospital.management.repository.BillingRepository;
import com.hospital.management.repository.DoctorRepository;
import com.hospital.management.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private BillingRepository billingRepository;

    @Override
    public void run(String... args) throws Exception {
        if (patientRepository.count() > 0) {
            return; // Data already seeded
        }

        Patient p1 = new Patient("Aarav Sharma", 34, "Male", "9876543210", "Admitted", LocalDateTime.now().minusDays(3), "Severe fever and chest congestion");
        Patient p2 = new Patient("Priya Patel", 28, "Female", "8765432109", "Outpatient", LocalDateTime.now().minusDays(1), "Regular pregnancy checkup");
        Patient p3 = new Patient("Rohan Verma", 45, "Male", "7654321098", "Admitted", LocalDateTime.now().minusDays(5), "Knee replacement surgery recovery");
        Patient p4 = new Patient("Sneha Reddy", 31, "Female", "6543210987", "Discharged", LocalDateTime.now().minusDays(10), "Acute gastroenteritis");
        patientRepository.saveAll(Arrays.asList(p1, p2, p3, p4));

        // 2. Seed Doctors
        Doctor d1 = new Doctor("Dr. Rajesh Nambiar", "Cardiology", "9012345678", "Available");
        Doctor d2 = new Doctor("Dr. Ananya Goel", "Neurology", "8901234567", "In Surgery");
        Doctor d3 = new Doctor("Dr. Vikram Seth", "General Medicine", "7890123456", "Available");
        Doctor d4 = new Doctor("Dr. Shalini Sen", "Pediatrics", "6789012345", "On Leave");
        doctorRepository.saveAll(Arrays.asList(d1, d2, d3, d4));

        // 3. Seed Appointments
        Appointment a1 = new Appointment(p1.getId(), p1.getName(), d3.getId(), d3.getName(), LocalDate.now(), "10:30 AM", "Scheduled", "General consultation for persistent fever");
        Appointment a2 = new Appointment(p2.getId(), p2.getName(), d1.getId(), d1.getName(), LocalDate.now().plusDays(1), "09:00 AM", "Scheduled", "Cardiogram evaluation");
        Appointment a3 = new Appointment(p4.getId(), p4.getName(), d3.getId(), d3.getName(), LocalDate.now().minusDays(10), "02:00 PM", "Completed", "Admitted for IV fluids and discharged after recovery");
        appointmentRepository.saveAll(Arrays.asList(a1, a2, a3));

        // 4. Seed Billings
        Billing b1 = new Billing(p3.getId(), p3.getName(), null, 500.0, 3000.0, 15000.0, 18500.0, "Pending", LocalDate.now().minusDays(1));
        Billing b2 = new Billing(p4.getId(), p4.getName(), a3.getId(), 500.0, 1500.0, 3000.0, 5000.0, "Paid", LocalDate.now().minusDays(10));
        billingRepository.saveAll(Arrays.asList(b1, b2));

        System.out.println("Hospital Management system database seeded successfully!");
    }
}
