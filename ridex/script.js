// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
});

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Booking form functionality
document.addEventListener('DOMContentLoaded', function() {
    const bookNowBtn = document.getElementById('book-now');
    const pickupInput = document.getElementById('pickup');
    const destinationInput = document.getElementById('destination');
    
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const pickup = pickupInput?.value.trim();
            const destination = destinationInput?.value.trim();
            
            if (!pickup || !destination) {
                showNotification('Please enter both pickup and destination locations', 'error');
                return;
            }
            
            // Simulate booking process
            showLoadingState();
            
            setTimeout(() => {
                hideLoadingState();
                showNotification('Ride booked successfully! Your driver will arrive in 5 minutes.', 'success');
                
                // Clear form
                if (pickupInput) pickupInput.value = '';
                if (destinationInput) destinationInput.value = '';
            }, 2000);
        });
    }
});

// Loading state for booking button
function showLoadingState() {
    const bookBtn = document.getElementById('book-now');
    if (bookBtn) {
        bookBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finding Rides...';
        bookBtn.disabled = true;
        bookBtn.style.opacity = '0.7';
    }
}

function hideLoadingState() {
    const bookBtn = document.getElementById('book-now');
    if (bookBtn) {
        bookBtn.innerHTML = '<i class="fas fa-search"></i> Find Rides';
        bookBtn.disabled = false;
        bookBtn.style.opacity = '1';
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 90px;
            right: 20px;
            z-index: 1001;
            background: white;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            overflow: hidden;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification-content {
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 300px;
        }
        
        .notification-success {
            border-left: 4px solid #10b981;
        }
        
        .notification-error {
            border-left: 4px solid #ef4444;
        }
        
        .notification-info {
            border-left: 4px solid #3b82f6;
        }
        
        .notification-success .fas {
            color: #10b981;
        }
        
        .notification-error .fas {
            color: #ef4444;
        }
        
        .notification-info .fas {
            color: #3b82f6;
        }
        
        .notification-close {
            background: none;
            border: none;
            cursor: pointer;
            color: #666;
            margin-left: auto;
        }
        
        .notification-close:hover {
            color: #333;
        }
        
        @media (max-width: 768px) {
            .notification {
                left: 20px;
                right: 20px;
                top: 90px;
            }
            
            .notification-content {
                min-width: auto;
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        hideNotification(notification);
    });
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        hideNotification(notification);
    }, 5000);
}

function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'error':
            return 'fa-exclamation-circle';
        default:
            return 'fa-info-circle';
    }
}

// Navbar background on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Intersection Observer for animations
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .feature-item, .testimonial-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
    });
});

// Service card hover effects
document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Testimonial carousel (basic implementation)
document.addEventListener('DOMContentLoaded', function() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    let currentIndex = 0;
    
    function showNextTestimonial() {
        // This would be more complex in a real carousel
        // For now, just add a subtle highlighting effect
        testimonialCards.forEach((card, index) => {
            if (index === currentIndex) {
                card.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.2)';
            } else {
                card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            }
        });
        
        currentIndex = (currentIndex + 1) % testimonialCards.length;
    }
    
    // Change highlighted testimonial every 5 seconds
    if (testimonialCards.length > 0) {
        setInterval(showNextTestimonial, 5000);
        showNextTestimonial(); // Initialize
    }
});

// Phone mockup app simulation
document.addEventListener('DOMContentLoaded', function() {
    const rideTypes = document.querySelectorAll('.ride-type');
    
    rideTypes.forEach(type => {
        type.addEventListener('click', function() {
            rideTypes.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Simulate price change
            const prices = ['$12', '$18', '$25', '$8'];
            const randomPrice = prices[Math.floor(Math.random() * prices.length)];
            this.querySelector('.price').textContent = randomPrice;
        });
    });
});

// Form validation
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.input-group input');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.style.borderColor = '#ef4444';
            } else {
                this.style.borderColor = '#10b981';
            }
        });
        
        input.addEventListener('focus', function() {
            this.style.borderColor = '#667eea';
        });
    });
});

// App store button interactions
document.addEventListener('DOMContentLoaded', function() {
    const appButtons = document.querySelectorAll('.app-button');
    
    appButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('App store link would open here in a real implementation', 'info');
        });
    });
});

// Add loading animation for page load
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Performance optimization: Lazy loading for images (if any were added)
document.addEventListener('DOMContentLoaded', function() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
});

// Error handling for failed network requests
window.addEventListener('error', function(e) {
    console.error('An error occurred:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

// Console welcome message
console.log('%cWelcome to RideX! 🚗', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%cThis is a demo ride-sharing website built with vanilla HTML, CSS, and JavaScript.', 'color: #333; font-size: 14px;');