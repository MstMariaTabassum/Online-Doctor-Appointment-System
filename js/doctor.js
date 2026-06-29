document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkAuth() || localStorage.getItem('user_role') !== 'doctor') {
        window.location.href = 'login.html';
        return;
    }
    
    // Display doctor name
    document.getElementById('doctorFullName').textContent = localStorage.getItem('user_name');
    document.getElementById('doctorName').textContent = localStorage.getItem('user_name');
    
    loadDashboard();
});

function loadDashboard() {
    const doctorId = localStorage.getItem('user_id');
    
    fetch(`php/get_doctor_stats.php?doctor_id=${doctorId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('doctorContent').innerHTML = `
                <div class="dashboard">
                    <!-- Statistics Cards -->
                    <div class="doctor-stats-grid">
                        <div class="doctor-stat-card pending">
                            <div class="stat-icon pending">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="stat-number">${data.pending_appointments || 0}</div>
                            <div class="stat-label">Pending Appointments</div>
                        </div>
                        
                        <div class="doctor-stat-card confirmed">
                            <div class="stat-icon confirmed">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="stat-number">${data.confirmed_appointments || 0}</div>
                            <div class="stat-label">Confirmed</div>
                        </div>
                        
                        <div class="doctor-stat-card completed">
                            <div class="stat-icon completed">
                                <i class="fas fa-calendar-check"></i>
                            </div>
                            <div class="stat-number">${data.completed_appointments || 0}</div>
                            <div class="stat-label">Completed</div>
                        </div>
                        
                        <div class="doctor-stat-card">
                            <div class="stat-icon" style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6;">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-number">${data.total_appointments || 0}</div>
                            <div class="stat-label">Total Appointments</div>
                        </div>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="admin-actions">
                        <h2><i class="fas fa-bolt"></i> Quick Actions</h2>
                        <div class="actions-grid">
                            <a href="#" onclick="loadAppointments()" class="action-btn">
                                <i class="fas fa-calendar-alt"></i>
                                <span>View All Appointments</span>
                            </a>
                            <a href="#" onclick="loadPendingAppointments()" class="action-btn">
                                <i class="fas fa-clock"></i>
                                <span>Pending Approvals</span>
                            </a>
                            <a href="#" onclick="loadProfile()" class="action-btn">
                                <i class="fas fa-user-md"></i>
                                <span>My Profile</span>
                            </a>
                            <a href="#" onclick="loadTodayAppointments()" class="action-btn">
                                <i class="fas fa-calendar-day"></i>
                                <span>Today's Schedule</span>
                            </a>
                        </div>
                    </div>
                    
                    <!-- Today's Appointments -->
                    <div class="recent-activity">
                        <h2><i class="fas fa-calendar-day"></i> Today's Appointments</h2>
                        <div id="todayAppointments">
                            <div class="empty-state">
                                <i class="fas fa-calendar"></i>
                                <h3>No appointments today</h3>
                                <p>You don't have any appointments scheduled for today.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Load today's appointments
            loadTodayAppointmentsList();
            
            // Update pending count
            updatePendingCount();
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('doctorContent').innerHTML = `
                <div class="dashboard">
                    <div style="text-align: center; padding: 50px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f59e0b; margin-bottom: 20px;"></i>
                        <h2>Error Loading Dashboard</h2>
                        <p>${error.message}</p>
                        <button onclick="loadDashboard()" class="btn" style="background: #3b82f6; color: white; padding: 10px 20px; margin-top: 20px;">
                            <i class="fas fa-redo"></i> Try Again
                        </button>
                    </div>
                </div>
            `;
        });
}

function loadAppointments() {
    const doctorId = localStorage.getItem('user_id');
    
    fetch(`php/get_appointments.php?role=doctor&id=${doctorId}`)
        .then(response => response.json())
        .then(appointments => {
            let html = `
                <div class="dashboard">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <h2><i class="fas fa-calendar-check"></i> My Appointments</h2>
                        <div style="display: flex; gap: 1rem;">
                            <button onclick="loadPendingAppointments()" class="btn" style="background: #f59e0b; color: white;">
                                <i class="fas fa-clock"></i> Pending (${appointments.filter(a => a.status === 'pending').length})
                            </button>
                            <button onclick="loadDashboard()" class="btn" style="background: #6b7280; color: white;">
                                <i class="fas fa-arrow-left"></i> Back to Dashboard
                            </button>
                        </div>
                    </div>
                    
                    <!-- Filter Tabs -->
                    <div style="margin-bottom: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
                        <button onclick="filterAppointments('all')" class="btn" style="background: #374151; color: white;">All</button>
                        <button onclick="filterAppointments('pending')" class="btn" style="background: #f59e0b; color: white;">Pending</button>
                        <button onclick="filterAppointments('confirmed')" class="btn" style="background: #10b981; color: white;">Confirmed</button>
                        <button onclick="filterAppointments('completed')" class="btn" style="background: #3b82f6; color: white;">Completed</button>
                        <button onclick="filterAppointments('cancelled')" class="btn" style="background: #ef4444; color: white;">Cancelled</button>
                    </div>
                    
                    <div class="admin-table-container">
                        <div class="admin-table-header">
                            <h3>All Appointments (${appointments.length})</h3>
                            <div class="table-search">
                                <input type="text" id="searchAppointments" placeholder="Search appointments..." onkeyup="searchAppointments()">
                                <i class="fas fa-search"></i>
                            </div>
                        </div>
                        
                        <div class="table-responsive">
                            <table class="admin-table" id="appointmentsTable">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Status</th>
                                        <th>Fee</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
            `;
            
            if (appointments.length === 0) {
                html += `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 3rem;">
                            <i class="fas fa-calendar-times" style="font-size: 3rem; color: #d1d5db; margin-bottom: 1rem;"></i>
                            <h3 style="color: #6b7280;">No appointments found</h3>
                            <p>You don't have any appointments yet.</p>
                        </td>
                    </tr>
                `;
            } else {
                appointments.forEach(appointment => {
                    const statusBadge = getStatusBadge(appointment.status);
                    
                    html += `
                        <tr class="appointment-row" data-status="${appointment.status}">
                            <td>
                                <strong>${appointment.patient_name}</strong><br>
                                <small style="color: #6b7280;">${appointment.patient_phone}</small>
                            </td>
                            <td>${appointment.appointment_date}</td>
                            <td>${appointment.appointment_time}</td>
                            <td>${statusBadge}</td>
                            <td>$${appointment.consultation_fee}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn-view" onclick="viewAppointmentDetails(${appointment.id})">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                    ${getActionButtons(appointment)}
                                </div>
                            </td>
                        </tr>
                    `;
                });
            }
            
            html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('doctorContent').innerHTML = html;
            window.currentAppointments = appointments;
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function loadPendingAppointments() {
    const doctorId = localStorage.getItem('user_id');
    
    fetch(`php/get_appointments.php?role=doctor&id=${doctorId}`)
        .then(response => response.json())
        .then(appointments => {
            const pendingAppointments = appointments.filter(a => a.status === 'pending');
            
            let html = `
                <div class="dashboard">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <h2><i class="fas fa-clock"></i> Pending Approvals</h2>
                        <div style="display: flex; gap: 1rem;">
                            <button onclick="loadAppointments()" class="btn" style="background: #3b82f6; color: white;">
                                <i class="fas fa-calendar-alt"></i> All Appointments
                            </button>
                            <button onclick="loadDashboard()" class="btn" style="background: #6b7280; color: white;">
                                <i class="fas fa-arrow-left"></i> Dashboard
                            </button>
                        </div>
                    </div>
                    
                    <div class="admin-table-container">
                        <div class="admin-table-header">
                            <h3>Pending Appointments (${pendingAppointments.length})</h3>
                            <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 0.9rem;">
                                <i class="fas fa-info-circle"></i> These appointments need your approval
                            </p>
                        </div>
                        
                        <div class="table-responsive">
            `;
            
            if (pendingAppointments.length === 0) {
                html += `
                    <div style="text-align: center; padding: 4rem;">
                        <i class="fas fa-check-circle" style="font-size: 4rem; color: #10b981; margin-bottom: 1rem;"></i>
                        <h3 style="color: #374151;">No pending appointments</h3>
                        <p style="color: #6b7280;">All appointments have been processed.</p>
                    </div>
                `;
            } else {
                html += `
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Symptoms</th>
                                <th>Fee</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                pendingAppointments.forEach(appointment => {
                    html += `
                        <tr>
                            <td>
                                <strong>${appointment.patient_name}</strong><br>
                                <small style="color: #6b7280;">${appointment.patient_phone}</small>
                            </td>
                            <td>${appointment.appointment_date}</td>
                            <td>${appointment.appointment_time}</td>
                            <td style="max-width: 200px;">${appointment.symptoms.substring(0, 50)}...</td>
                            <td>$${appointment.consultation_fee}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn-approve" onclick="approveAppointment(${appointment.id})">
                                        <i class="fas fa-check"></i> Approve
                                    </button>
                                    <button class="btn-cancel" onclick="cancelAppointment(${appointment.id})">
                                        <i class="fas fa-times"></i> Reject
                                    </button>
                                    <button class="btn-view" onclick="viewAppointmentDetails(${appointment.id})">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
                
                html += `</tbody></table>`;
            }
            
            html += `
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('doctorContent').innerHTML = html;
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Helper functions
function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="status-badge badge-pending">Pending</span>',
        'confirmed': '<span class="status-badge badge-confirmed">Confirmed</span>',
        'completed': '<span class="status-badge badge-completed">Completed</span>',
        'cancelled': '<span class="status-badge badge-cancelled">Cancelled</span>'
    };
    return badges[status] || '<span class="status-badge">Unknown</span>';
}

function getActionButtons(appointment) {
    let buttons = '';
    
    if (appointment.status === 'pending') {
        buttons += `
            <button class="btn-approve" onclick="approveAppointment(${appointment.id})">
                <i class="fas fa-check"></i> Approve
            </button>
            <button class="btn-cancel" onclick="cancelAppointment(${appointment.id})">
                <i class="fas fa-times"></i> Reject
            </button>
        `;
    } else if (appointment.status === 'confirmed') {
        buttons += `
            <button class="btn-complete" onclick="completeAppointment(${appointment.id})">
                <i class="fas fa-check-circle"></i> Complete
            </button>
            <button class="btn-cancel" onclick="cancelAppointment(${appointment.id})">
                <i class="fas fa-times"></i> Cancel
            </button>
        `;
    }
    
    return buttons;
}

// Appointment Actions
function approveAppointment(appointmentId) {
    if (confirm('Are you sure you want to approve this appointment?')) {
        updateAppointmentStatus(appointmentId, 'confirmed');
    }
}

function completeAppointment(appointmentId) {
    if (confirm('Mark this appointment as completed?')) {
        updateAppointmentStatus(appointmentId, 'completed');
    }
}

function cancelAppointment(appointmentId) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        updateAppointmentStatus(appointmentId, 'cancelled');
    }
}

function updateAppointmentStatus(appointmentId, status) {
    fetch('php/update_status.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            appointment_id: appointmentId,
            status: status
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert(`Appointment ${status} successfully!`);
            loadAppointments();
            updatePendingCount();
        } else {
            alert('Error updating appointment status');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error updating appointment status');
    });
}

function viewAppointmentDetails(appointmentId) {
    fetch(`php/get_appointment_details.php?id=${appointmentId}`)
        .then(response => response.json())
        .then(appointment => {
            const modal = document.getElementById('appointmentModal');
            const detailsDiv = document.getElementById('appointmentDetails');
            
            detailsDiv.innerHTML = `
                <div class="appointment-details">
                    <div class="detail-row">
                        <div class="detail-label">Patient Name:</div>
                        <div class="detail-value">${appointment.patient_name}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Phone:</div>
                        <div class="detail-value">${appointment.patient_phone}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Appointment Date:</div>
                        <div class="detail-value">${appointment.appointment_date}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Appointment Time:</div>
                        <div class="detail-value">${appointment.appointment_time}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Status:</div>
                        <div class="detail-value">${getStatusBadge(appointment.status)}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Consultation Fee:</div>
                        <div class="detail-value">$${appointment.consultation_fee}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Symptoms:</div>
                        <div class="detail-value">${appointment.symptoms}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Booked On:</div>
                        <div class="detail-value">${appointment.created_at}</div>
                    </div>
                </div>
            `;
            
            modal.style.display = 'flex';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error loading appointment details');
        });
}

function closeModal() {
    document.getElementById('appointmentModal').style.display = 'none';
}

function filterAppointments(status) {
    const rows = document.querySelectorAll('.appointment-row');
    rows.forEach(row => {
        if (status === 'all' || row.dataset.status === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function searchAppointments() {
    const searchTerm = document.getElementById('searchAppointments').value.toLowerCase();
    const rows = document.querySelectorAll('.appointment-row');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function updatePendingCount() {
    const doctorId = localStorage.getItem('user_id');
    
    fetch(`php/get_appointments.php?role=doctor&id=${doctorId}`)
        .then(response => response.json())
        .then(appointments => {
            const pendingCount = appointments.filter(a => a.status === 'pending').length;
            document.getElementById('pendingCount').textContent = pendingCount;
        });
}

function loadTodayAppointmentsList() {
    const doctorId = localStorage.getItem('user_id');
    const today = new Date().toISOString().split('T')[0];
    
    fetch(`php/get_appointments.php?role=doctor&id=${doctorId}`)
        .then(response => response.json())
        .then(appointments => {
            const todayAppointments = appointments.filter(a => 
                a.appointment_date === today && 
                (a.status === 'confirmed' || a.status === 'pending')
            );
            
            const container = document.getElementById('todayAppointments');
            
            if (todayAppointments.length === 0) {
                return;
            }
            
            let html = '<div class="activity-list">';
            
            todayAppointments.forEach(appointment => {
                html += `
                    <div class="activity-item">
                        <div class="activity-icon appointment">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="activity-content">
                            <h4>${appointment.patient_name}</h4>
                            <p>${appointment.appointment_time} - ${appointment.symptoms.substring(0, 50)}...</p>
                        </div>
                        <div class="activity-time">
                            <i class="far fa-clock"></i> ${getStatusBadge(appointment.status)}
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            container.innerHTML = html;
        });
}

// Other functions remain the same...
function loadProfile() {
    // Profile loading function
}

function loadSchedule() {
    // Schedule loading function
}