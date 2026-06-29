// Handle Login Form
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            fetch('php/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                const messageDiv = document.getElementById('loginMessage');
                if (result.success) {
                    messageDiv.className = 'message success';
                    messageDiv.textContent = result.message;
                    
                    // Store user data in localStorage
                    localStorage.setItem('user_id', result.user.id);
                    localStorage.setItem('user_role', result.user.role);
                    localStorage.setItem('user_name', result.user.name);
                    
                    // Redirect based on role
                    setTimeout(() => {
                        if (data.role === 'admin') {
                            window.location.href = 'admin.html';
                        } else if (data.role === 'doctor') {
                            window.location.href = 'doctor.html';
                        } else {
                            window.location.href = 'patient.html';
                        }
                    }, 1000);
                } else {
                    messageDiv.className = 'message error';
                    messageDiv.textContent = result.message;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const messageDiv = document.getElementById('loginMessage');
                messageDiv.className = 'message error';
                messageDiv.textContent = 'An error occurred. Please try again.';
            });
        });
    }
    
    // Handle Registration Form
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            fetch('php/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                const messageDiv = document.getElementById('registerMessage');
                if (result.success) {
                    messageDiv.className = 'message success';
                    messageDiv.textContent = result.message;
                    
                    // Redirect to login after successful registration
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    messageDiv.className = 'message error';
                    messageDiv.textContent = result.message;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const messageDiv = document.getElementById('registerMessage');
                messageDiv.className = 'message error';
                messageDiv.textContent = 'An error occurred. Please try again.';
            });
        });
    }
});

// Logout function
// Handle Login Form
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            fetch('php/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                const messageDiv = document.getElementById('loginMessage');
                if (result.success) {
                    messageDiv.className = 'message success';
                    messageDiv.textContent = result.message;
                    
                    // Store user data in localStorage
                    localStorage.setItem('user_id', result.user.id);
                    localStorage.setItem('user_role', result.user.role);
                    localStorage.setItem('user_name', result.user.name);
                    localStorage.setItem('user_email', result.user.email);
                    
                    // Redirect based on role
                    setTimeout(() => {
                        if (data.role === 'admin') {
                            window.location.href = 'admin.html';
                        } else if (data.role === 'doctor') {
                            window.location.href = 'doctor.html';
                        } else {
                            window.location.href = 'patient.html';
                        }
                    }, 1000);
                } else {
                    messageDiv.className = 'message error';
                    messageDiv.textContent = result.message;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const messageDiv = document.getElementById('loginMessage');
                messageDiv.className = 'message error';
                messageDiv.textContent = 'An error occurred. Please try again.';
            });
        });
    }
    
    // Handle Registration Form
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            fetch('php/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                const messageDiv = document.getElementById('registerMessage');
                if (result.success) {
                    messageDiv.className = 'message success';
                    messageDiv.textContent = result.message;
                    
                    // Redirect to login after successful registration
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    messageDiv.className = 'message error';
                    messageDiv.textContent = result.message;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const messageDiv = document.getElementById('registerMessage');
                messageDiv.className = 'message error';
                messageDiv.textContent = 'An error occurred. Please try again.';
            });
        });
    }
    
    // Check authentication on dashboard pages
    const dashboardPages = ['admin.html', 'doctor.html', 'patient.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (dashboardPages.includes(currentPage)) {
        const userId = localStorage.getItem('user_id');
        const userRole = localStorage.getItem('user_role');
        
        if (!userId || !userRole) {
            window.location.href = 'login.html';
        }
    }
});

// Logout function
function logout() {
    // Clear localStorage first
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    
    // Redirect to PHP logout to clear session
    window.location.href = 'php/logout.php';
}

// Check if user is logged in
function checkAuth() {
    const userId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('user_role');
    
    if (!userId || !userRole) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}