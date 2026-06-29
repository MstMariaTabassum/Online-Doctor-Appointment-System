document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkAuth() || localStorage.getItem('user_role') !== 'patient') {
        window.location.href = 'login.html';
        return;
    }
    
    // Display patient name
    document.getElementById('patientName').textContent = localStorage.getItem('user_name');
    loadDashboard();
});

function loadDashboard() {
    document.getElementById('patientContent').innerHTML = `
        <div class="dashboard">
            <h2>Welcome, ${localStorage.getItem('user_name')}</h2>
            <p>Manage your appointments and health</p>
            <div style="margin-top: 40px; text-align: center;">
                <button onclick="loadBookAppointment()" class="btn btn-success" style="padding: 18px 35px; font-size: 18px; margin-right: 15px;">
                    📅 Book New Appointment
                </button>
                <button onclick="loadMyAppointments()" class="btn" style="padding: 18px 35px; font-size: 18px; background: #3498db; color: white;">
                    📋 View My Appointments
                </button>
            </div>
        </div>
    `;
}

function loadBookAppointment() {
    document.getElementById('patientContent').innerHTML = `
        <div class="dashboard">
            <h2>Book Appointment</h2>
            <button onclick="loadDashboard()" class="btn" style="background: #95a5a6; color: white; margin-bottom: 20px;">← Back to Dashboard</button>
            
            <div class="appointment-form">
                <h3>Step 1: Select Doctor</h3>
                <div id="doctorsLoading" class="loading">Loading doctors...</div>
                <div id="doctorOptions" class="doctor-options" style="display: none;"></div>
                
                <form id="bookAppointmentForm" style="margin-top: 30px; display: none;">
                    <h3>Step 2: Appointment Details</h3>
                    <input type="hidden" id="selectedDoctorId" name="doctor_id">
                    
                    <div class="form-group">
                        <label for="appointmentDate">📅 Appointment Date</label>
                        <input type="date" id="appointmentDate" name="appointment_date" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="appointmentTime">⏰ Appointment Time</label>
                        <input type="time" id="appointmentTime" name="appointment_time" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="symptoms">🤒 Symptoms / Reason for Visit</label>
                        <textarea id="symptoms" name="symptoms" rows="4" required placeholder="Please describe your symptoms or reason for appointment"></textarea>
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-top: 30px;">
                        <button type="submit" class="btn btn-success" style="flex: 1; padding: 15px; font-size: 16px;">
                            📋 Book Appointment
                        </button>
                        <button type="button" onclick="loadDashboard()" class="btn" style="background: #95a5a6; color: white; padding: 15px; font-size: 16px;">
                            Cancel
                        </button>
                    </div>
                </form>
                
                <div id="appointmentMessage" class="message"></div>
            </div>
        </div>
    `;
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;
    document.getElementById('appointmentDate').value = today;
    
    // Set default time to next hour
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    const hours = nextHour.getHours().toString().padStart(2, '0');
    const minutes = '00'; // Always start at whole hour
    const timeString = `${hours}:${minutes}`;
    document.getElementById('appointmentTime').value = timeString;
    
    // Load doctors
    loadDoctors();
    function loadDoctors() {
    console.log("=== Loading Doctors Function Called ===");
    
    const loadingDiv = document.getElementById('doctorsLoading');
    const optionsDiv = document.getElementById('doctorOptions');
    const formDiv = document.getElementById('bookAppointmentForm');
    
    loadingDiv.innerHTML = '<div style="padding: 30px; text-align: center;">🔄 Loading doctors...</div>';
    optionsDiv.style.display = 'none';
    formDiv.style.display = 'none';
    
    fetch('php/get_doctors.php')
        .then(response => {
            console.log("Response received, status:", response.status, response.statusText);
            return response.json().then(data => {
                console.log("Response data:", data);
                return {status: response.status, data: data};
            });
        })
        .then(result => {
            console.log("Processing doctors data:", result.data);
            
            loadingDiv.style.display = 'none';
            optionsDiv.style.display = 'grid';
            
            // Check if we have valid doctors
            if (!result.data || result.data.length === 0 || 
                (result.data.length === 1 && result.data[0].user_id === 0)) {
                
                optionsDiv.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #f8f9fa; border-radius: 8px;">
                        <h3 style="color: #7f8c8d;">No Doctors Available</h3>
                        <p>There are no doctors registered in the system yet.</p>
                        <p>Please contact administration or check back later.</p>
                    </div>
                `;
                return;
            }
            
            // Check for error response
            if (result.data.error) {
                optionsDiv.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #fde8e8; border-radius: 8px; color: #e74c3c;">
                        <h3>Error Loading Doctors</h3>
                        <p>${result.data.message}</p>
                        <button onclick="loadDoctors()" class="btn" style="background: #3498db; color: white; margin-top: 10px;">
                            Try Again
                        </button>
                    </div>
                `;
                return;
            }
            
            // Display doctors
            let doctorsHTML = '';
            result.data.forEach(doctor => {
                console.log("Adding doctor:", doctor);
                doctorsHTML += `
                    <div class="doctor-option" 
                         onclick="selectDoctor(${doctor.user_id}, '${doctor.name.replace(/'/g, "\\'")}', '${doctor.specialization ? doctor.specialization.replace(/'/g, "\\'") : 'General'}', ${doctor.consultation_fee || 0})">
                        <h3>Dr. ${doctor.name}</h3>
                        <p><strong>Specialization:</strong> ${doctor.specialization || 'General Physician'}</p>
                        <p><strong>Experience:</strong> ${doctor.experience || 0} years</p>
                        <p><strong>Fee:</strong> $${doctor.consultation_fee || 0}</p>
                        <div style="margin-top: 10px; padding: 5px; background: #3498db; color: white; text-align: center; border-radius: 4px;">
                            Click to Select
                        </div>
                    </div>
                `;
            });
            
            optionsDiv.innerHTML = doctorsHTML;
            formDiv.style.display = 'block';
            
            console.log("Doctors loaded successfully");
            
        })
        .catch(error => {
            console.error("Error in loadDoctors:", error);
            loadingDiv.innerHTML = `
                <div style="padding: 30px; text-align: center; color: #e74c3c;">
                    <h3>Failed to Load Doctors</h3>
                    <p>Error: ${error.message}</p>
                    <button onclick="loadDoctors()" class="btn" style="background: #3498db; color: white; margin-top: 10px;">
                        Retry
                    </button>
                    <p style="margin-top: 10px; font-size: 14px;">
                        <a href="#" onclick="window.location.reload()">Or reload the page</a>
                    </p>
                </div>
            `;
        });
}
    
    // Setup form submission
    document.getElementById('bookAppointmentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitAppointment();
    });
}

function loadDoctors() {
    fetch('php/get_doctors.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(doctors => {
            const loadingDiv = document.getElementById('doctorsLoading');
            const optionsDiv = document.getElementById('doctorOptions');
            const formDiv = document.getElementById('bookAppointmentForm');
            
            loadingDiv.style.display = 'none';
            optionsDiv.style.display = 'grid';
            
            if (doctors.length === 0) {
                optionsDiv.innerHTML = '<div class="loading">No doctors available at the moment.</div>';
                return;
            }
            
            let doctorsHTML = '';
            doctors.forEach(doctor => {
                doctorsHTML += `
                    <div class="doctor-option" onclick="selectDoctor(${doctor.user_id}, '${doctor.name}', '${doctor.specialization}', ${doctor.consultation_fee})">
                        <h3>Dr. ${doctor.name}</h3>
                        <p><strong>Specialization:</strong> ${doctor.specialization}</p>
                        <p><strong>Experience:</strong> ${doctor.experience} years</p>
                        <p><strong>Consultation Fee:</strong> $${doctor.consultation_fee}</p>
                        <div style="margin-top: 10px; color: #3498db; font-weight: bold;">
                            Click to select
                        </div>
                    </div>
                `;
            });
            
            optionsDiv.innerHTML = doctorsHTML;
            formDiv.style.display = 'block';
        })
        .catch(error => {
            console.error('Error loading doctors:', error);
            document.getElementById('doctorsLoading').innerHTML = 
                '<div class="loading" style="color: #e74c3c;">Error loading doctors. Please try again.</div>';
        });
}

function selectDoctor(doctorId, doctorName, specialization, fee) {
    // Remove selection from all doctors
    document.querySelectorAll('.doctor-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selection to clicked doctor
    event.currentTarget.classList.add('selected');
    
    // Store selected doctor
    document.getElementById('selectedDoctorId').value = doctorId;
    
    // Show confirmation
    const messageDiv = document.getElementById('appointmentMessage');
    messageDiv.innerHTML = `
        <div style="background: #e8f4fc; padding: 15px; border-radius: 6px; border-left: 4px solid #3498db;">
            <strong>✅ Doctor Selected:</strong> Dr. ${doctorName}<br>
            <strong>Specialization:</strong> ${specialization}<br>
            <strong>Fee:</strong> $${fee}
        </div>
    `;
    messageDiv.className = 'message success';
    
    // Scroll to form
    document.getElementById('bookAppointmentForm').scrollIntoView({ behavior: 'smooth' });
}

function submitAppointment() {
    const doctorId = document.getElementById('selectedDoctorId').value;
    const appointmentDate = document.getElementById('appointmentDate').value;
    const appointmentTime = document.getElementById('appointmentTime').value;
    const symptoms = document.getElementById('symptoms').value;
    
    if (!doctorId) {
        showMessage('Please select a doctor first', 'error');
        return;
    }
    
    if (!appointmentDate || !appointmentTime || !symptoms) {
        showMessage('Please fill in all appointment details', 'error');
        return;
    }
    
    // Validate date
    const selectedDate = new Date(appointmentDate + 'T' + appointmentTime);
    const now = new Date();
    
    if (selectedDate < now) {
        showMessage('Cannot book appointment in the past. Please select a future date and time.', 'error');
        return;
    }
    
    const data = {
        patient_id: localStorage.getItem('user_id'),
        doctor_id: doctorId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        symptoms: symptoms
    };
    
    // Show loading
    showMessage('Booking your appointment...', 'info');
    
    fetch('php/book_appointment.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(result => {
        console.log('Appointment booking result:', result);
        
        if (result.success) {
            showMessage(`✅ ${result.message}`, 'success');
            
            // Clear form
            document.getElementById('bookAppointmentForm').reset();
            document.getElementById('selectedDoctorId').value = '';
            
            // Remove selection from doctors
            document.querySelectorAll('.doctor-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            // Reload appointments after 2 seconds
            setTimeout(() => {
                loadMyAppointments();
            }, 2000);
        } else {
            showMessage(`❌ ${result.message}`, 'error');
        }
    })
    .catch(error => {
        console.error('Error booking appointment:', error);
        showMessage('❌ Error booking appointment. Please try again.', 'error');
    });
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('appointmentMessage');
    messageDiv.innerHTML = message;
    messageDiv.className = 'message ' + type;
    messageDiv.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

function loadMyAppointments() {
    const patientId = localStorage.getItem('user_id');
    
    fetch(`php/get_patient_appointments.php?patient_id=${patientId}`)
        .then(response => response.json())
        .then(appointments => {
            let html = `
                <div class="dashboard">
                    <h2>My Appointments</h2>
                    <button onclick="loadDashboard()" class="btn" style="background: #3498db; color: white; margin-bottom: 20px;">← Back to Dashboard</button>
                    <button onclick="loadBookAppointment()" class="btn btn-success" style="margin-bottom: 20px; margin-left: 10px;">📅 Book New Appointment</button>
            `;
            
            if (appointments.length === 0) {
                html += `
                    <div style="text-align: center; padding: 40px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h3 style="color: #7f8c8d;">No appointments found</h3>
                        <p>You haven't booked any appointments yet.</p>
                        <button onclick="loadBookAppointment()" class="btn btn-success" style="margin-top: 20px; padding: 12px 25px;">
                            Book Your First Appointment
                        </button>
                    </div>
                `;
            } else {
                html += `
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Doctor</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Symptoms</th>
                                    <th>Status</th>
                                    <th>Fee</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                appointments.forEach(apt => {
                    const statusClass = `status-${apt.status}`;
                    
                    html += `
                        <tr>
                            <td><strong>Dr. ${apt.doctor_name}</strong></td>
                            <td>${apt.appointment_date}</td>
                            <td>${apt.appointment_time}</td>
                            <td>${apt.symptoms}</td>
                            <td><span class="${statusClass}">${apt.status}</span></td>
                            <td>$${apt.consultation_fee}</td>
                            <td>
                    `;
                    
                    if (apt.status === 'pending' || apt.status === 'confirmed') {
                        html += `
                            <button class="btn btn-danger" onclick="cancelAppointment(${apt.id})" style="padding: 6px 12px; font-size: 14px;">
                                Cancel
                            </button>
                        `;
                    } else {
                        html += `<span style="color: #95a5a6;">No actions</span>`;
                    }
                    
                    html += `</td></tr>`;
                });
                
                html += `</tbody></table></div>`;
            }
            
            html += `</div>`;
            
            document.getElementById('patientContent').innerHTML = html;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('patientContent').innerHTML = `
                <div class="dashboard">
                    <h2>My Appointments</h2>
                    <div style="color: #e74c3c; padding: 20px; background: #fde8e8; border-radius: 6px;">
                        Error loading appointments. Please try again.
                    </div>
                    <button onclick="loadDashboard()" class="btn" style="background: #3498db; color: white; margin-top: 20px;">Back to Dashboard</button>
                </div>
            `;
        });
}

function cancelAppointment(appointmentId) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        fetch('php/update_status.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                appointment_id: appointmentId,
                status: 'cancelled'
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('✅ Appointment cancelled successfully');
                loadMyAppointments();
            } else {
                alert('❌ Error cancelling appointment');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('❌ Error cancelling appointment');
        });
    }
}