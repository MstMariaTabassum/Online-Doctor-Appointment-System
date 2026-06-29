document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkAuth() || localStorage.getItem('user_role') !== 'admin') {
        window.location.href = 'login.html';
        return;
    }
    
    // Display admin name
    document.getElementById('adminName').textContent = localStorage.getItem('user_name') || 'Admin';
    
    loadDashboard();
});

function loadDashboard() {
    fetch('php/get_stats.php')
        .then(response => response.json())
        .then(data => {
            // Format numbers
            const totalUsers = data.total_users || 0;
            const totalDoctors = data.total_doctors || 0;
            const totalAppointments = data.total_appointments || 0;
            const todayAppointments = data.today_appointments || 0;
            
            document.getElementById('adminContent').innerHTML = `
                <div class="dashboard">
                    <!-- Statistics Cards -->
                    <div class="stats-grid">
                        <div class="stat-card users">
                            <i class="fas fa-users"></i>
                            <h3>Total Users</h3>
                            <div class="number">${totalUsers}</div>
                            <p>Registered in system</p>
                        </div>
                        
                        <div class="stat-card doctors">
                            <i class="fas fa-user-md"></i>
                            <h3>Total Doctors</h3>
                            <div class="number">${totalDoctors}</div>
                            <p>Available for appointments</p>
                        </div>
                        
                        <div class="stat-card appointments">
                            <i class="fas fa-calendar-alt"></i>
                            <h3>Total Appointments</h3>
                            <div class="number">${totalAppointments}</div>
                            <p>All time appointments</p>
                        </div>
                        
                        <div class="stat-card today">
                            <i class="fas fa-clock"></i>
                            <h3>Today's Appointments</h3>
                            <div class="number">${todayAppointments}</div>
                            <p>Scheduled for today</p>
                        </div>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="quick-actions">
                        <h2><i class="fas fa-bolt"></i> Quick Actions</h2>
                        <div class="action-buttons">
                            <div class="action-btn" onclick="loadUsers()">
                                <i class="fas fa-user-plus"></i>
                                <span>Manage Users</span>
                            </div>
                            <div class="action-btn" onclick="loadAppointments()">
                                <i class="fas fa-calendar-check"></i>
                                <span>View Appointments</span>
                            </div>
                            <div class="action-btn" onclick="loadDoctors()">
                                <i class="fas fa-stethoscope"></i>
                                <span>Manage Doctors</span>
                            </div>
                            <div class="action-btn" onclick="showReports()">
                                <i class="fas fa-chart-bar"></i>
                                <span>View Reports</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Recent Activity -->
                    <div class="recent-activity">
                        <h2><i class="fas fa-history"></i> Recent Activity</h2>
                        <div id="recentActivity">
                            <div class="empty-state">
                                <i class="fas fa-history"></i>
                                <h3>No recent activity</h3>
                                <p>Activities will appear here</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Load recent activity
            loadRecentActivity();
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('adminContent').innerHTML = `
                <div class="dashboard">
                    <div style="text-align: center; padding: 50px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f39c12; margin-bottom: 20px;"></i>
                        <h2>Error Loading Dashboard</h2>
                        <p>${error.message}</p>
                        <button onclick="loadDashboard()" class="btn" style="background: #3498db; color: white; padding: 10px 20px; margin-top: 20px;">
                            <i class="fas fa-redo"></i> Try Again
                        </button>
                    </div>
                </div>
            `;
        });
}

function loadRecentActivity() {
    fetch('php/get_recent_activity.php')
        .then(response => response.json())
        .then(activities => {
            const activityDiv = document.getElementById('recentActivity');
            
            if (activities.length === 0) {
                return;
            }
            
            let activityHTML = '<ul class="activity-list">';
            
            activities.forEach(activity => {
                let icon = 'fas fa-info-circle';
                let color = '#3498db';
                
                switch(activity.type) {
                    case 'appointment':
                        icon = 'fas fa-calendar-plus';
                        color = '#2ecc71';
                        break;
                    case 'user':
                        icon = 'fas fa-user-plus';
                        color = '#3498db';
                        break;
                    case 'doctor':
                        icon = 'fas fa-user-md';
                        color = '#9b59b6';
                        break;
                    case 'login':
                        icon = 'fas fa-sign-in-alt';
                        color = '#f39c12';
                        break;
                }
                
                activityHTML += `
                    <li class="activity-item">
                        <div class="activity-icon" style="background-color: ${color}20; color: ${color};">
                            <i class="${icon}"></i>
                        </div>
                        <div class="activity-content">
                            <div>${activity.description}</div>
                            <div class="activity-time">
                                <i class="far fa-clock"></i> ${activity.time}
                            </div>
                        </div>
                    </li>
                `;
            });
            
            activityHTML += '</ul>';
            activityDiv.innerHTML = activityHTML;
        })
        .catch(error => {
            console.error('Error loading activity:', error);
        });
}

function loadUsers() {
    fetch('php/get_all_users.php')
        .then(response => response.json())
        .then(users => {
            let html = `
                <div class="dashboard">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <h2><i class="fas fa-users"></i> Manage Users</h2>
                        <button onclick="loadDashboard()" class="btn" style="background: #3498db; color: white;">
                            <i class="fas fa-arrow-left"></i> Back to Dashboard
                        </button>
                    </div>
                    
                    <div style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <div style="padding: 1.5rem; border-bottom: 1px solid #eee; background: #f8f9fa;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h3 style="margin: 0;">All Users (${users.length})</h3>
                                <div style="color: #6c757d;">
                                    <i class="fas fa-info-circle"></i> Total registered users
                                </div>
                            </div>
                        </div>
                        
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr style="background: #f5f5f5;">
                                        <th><i class="fas fa-id-card"></i> ID</th>
                                        <th><i class="fas fa-user"></i> Name</th>
                                        <th><i class="fas fa-envelope"></i> Email</th>
                                        <th><i class="fas fa-user-tag"></i> Role</th>
                                        <th><i class="fas fa-phone"></i> Phone</th>
                                        <th><i class="fas fa-calendar"></i> Registered</th>
                                        <th><i class="fas fa-cog"></i> Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
            `;
            
            if (users.length === 0) {
                html += `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 3rem;">
                            <i class="fas fa-user-slash" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
                            <h3 style="color: #6c757d;">No users found</h3>
                        </td>
                    </tr>
                `;
            } else {
                users.forEach(user => {
                    let roleBadge = '';
                    switch(user.role) {
                        case 'admin':
                            roleBadge = '<span style="background: #e74c3c; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">Admin</span>';
                            break;
                        case 'doctor':
                            roleBadge = '<span style="background: #3498db; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">Doctor</span>';
                            break;
                        case 'patient':
                            roleBadge = '<span style="background: #2ecc71; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">Patient</span>';
                            break;
                    }
                    
                    html += `
                        <tr>
                            <td>${user.id}</td>
                            <td><strong>${user.name}</strong></td>
                            <td>${user.email}</td>
                            <td>${roleBadge}</td>
                            <td>${user.phone}</td>
                            <td>${user.created_at ? user.created_at.split(' ')[0] : 'N/A'}</td>
                            <td>
                                <button class="btn btn-danger" onclick="deleteUser(${user.id})" style="padding: 5px 10px; font-size: 0.9rem;">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
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
            
            document.getElementById('adminContent').innerHTML = html;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('adminContent').innerHTML = `
                <div class="dashboard">
                    <div style="text-align: center; padding: 50px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f39c12; margin-bottom: 20px;"></i>
                        <h2>Error Loading Users</h2>
                        <p>${error.message}</p>
                        <button onclick="loadDashboard()" class="btn" style="background: #3498db; color: white; padding: 10px 20px; margin-top: 20px;">
                            <i class="fas fa-arrow-left"></i> Back to Dashboard
                        </button>
                    </div>
                </div>
            `;
        });
}

// বাকি ফাংশনগুলো আগের মতো থাকবে, শুধু UI update হবে

function showReports() {
    document.getElementById('adminContent').innerHTML = `
        <div class="dashboard">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2><i class="fas fa-chart-bar"></i> Reports & Analytics</h2>
                <button onclick="loadDashboard()" class="btn" style="background: #3498db; color: white;">
                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                </button>
            </div>
            
            <div style="background: white; border-radius: 10px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h3 style="color: #6c757d; margin-bottom: 1.5rem;">Coming Soon</h3>
                <div style="text-align: center; padding: 3rem;">
                    <i class="fas fa-chart-line" style="font-size: 4rem; color: #ddd; margin-bottom: 1rem;"></i>
                    <h3 style="color: #6c757d;">Reports Feature Under Development</h3>
                    <p>Detailed analytics and reports will be available in the next update.</p>
                </div>
            </div>
        </div>
    `;
}

// বাকি ফাংশনগুলো (loadAppointments, deleteUser, updateStatus, etc.) আগের মতোই থাকবে
// শুধু UI টা একটু সুন্দর করে নিন