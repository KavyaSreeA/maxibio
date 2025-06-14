// Main Application
class MaxwinApp {
  constructor() {
    this.currentPage = window.location.pathname.split('/').pop() || 'index.html';
    this.initializeApp();
  }

  // Initialize the application
  initializeApp() {
    var self = this;
    this.setupEventListeners();
    this.handleNavigation();
    this.initializeComponents();
    this.setupScrollAnimations();
    this.setupFormHandlers();
    
    // Add loaded class to body for transition effects
    document.body.classList.add('loaded');
    
    // Add smooth scroll behavior for the entire document
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  // Setup event listeners
  setupEventListeners() {
    var self = this;
    // Mobile menu toggle
    var menuToggle = document.querySelector('.menu-toggle');
    var navLinks = document.querySelector('.nav-links');
    
    if (menuToggle) {
      menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
      });

      // Close mobile menu when clicking on a nav link
      var navLinksList = document.querySelectorAll('.nav-links a');
      for (var i = 0; i <navLinksList.length; i++) {
        navLinksList[i].addEventListener('click', function() {
          menuToggle.classList.remove('active');
          navLinks.classList.remove('active');
          document.body.style.overflow = '';
        });
      }
    }
  }

  // Handle navigation and dynamic content loading
  handleNavigation() {
    // Smooth scrolling for anchor links
    var anchorLinks = document.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < anchorLinks.length; i++) {
      anchorLinks[i].addEventListener('click', function(e) {
        e.preventDefault();
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        var targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 100,
            behavior: 'smooth'
          });
        }
      });
    }
  }

  // Initialize UI components
  initializeComponents() {
    // Initialize counters if they exist on the page
    this.initializeCounters();
    
    // Initialize testimonials slider if it exists
    if (document.querySelector('.testimonials-slider')) {
      this.initializeTestimonials();
    }
    
    // Initialize product filters if on products page
    if (this.currentPage === 'products.html') {
      this.initializeProductFilters();
    }
  }

  // Initialize counter animation
  initializeCounters() {
    var self = this;
    var counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    function animateCounter(counterElement) {
      var target = parseInt(counterElement.getAttribute('data-target'), 10);
      var duration = 2000; // Animation duration in ms
      var step = (target / (duration / 16)); // 60fps
      var current = 0;
      
      function updateCounter() {
        current += step;
        
        if (current < target) {
          counterElement.textContent = Math.ceil(current);
          requestAnimationFrame(updateCounter);
        } else {
          counterElement.textContent = target;
        }
      }
      
      updateCounter();
    }

    // Start counter when element is in viewport
    var observer = new IntersectionObserver(function(entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          animateCounter(entries[i].target);
          observer.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.5 });

    for (var i = 0; i < counters.length; i++) {
      observer.observe(counters[i]);
    }
  }

  // Initialize testimonials slider
  initializeTestimonials() {
    var self = this;
    var currentSlide = 0;
    var slides = document.querySelectorAll('.testimonial');
    var totalSlides = slides.length;
    
    if (totalSlides <= 1) return;
    
    function updateSlider() {
      for (var i = 0; i < slides.length; i++) {
        slides[i].style.transform = 'translateX(' + (100 * (i - currentSlide)) + '%)';
        slides[i].style.opacity = i === currentSlide ? '1' : '0';
      }
    }
    
    // Auto-advance slides
    setInterval(function() {
      currentSlide = (currentSlide + 1) % totalSlides;
      updateSlider();
    }, 5000);
    
    updateSlider();
  }

  // Initialize product filters
  initializeProductFilters() {
    var filterButtons = document.querySelectorAll('.filter-btn');
    var productCards = document.querySelectorAll('.product-card');
    var i, j;
    
    for (i = 0; i < filterButtons.length; i++) {
      filterButtons[i].addEventListener('click', function() {
        // Update active state
        for (j = 0; j < filterButtons.length; j++) {
          filterButtons[j].classList.remove('active');
        }
        this.classList.add('active');
        
        var filterValue = this.getAttribute('data-filter');
        
        // Filter products
        for (j = 0; j < productCards.length; j++) {
          if (filterValue === 'all' || productCards[j].getAttribute('data-category') === filterValue) {
            productCards[j].style.display = 'flex';
            (function(card) {
              setTimeout(function() {
                card.style.opacity = '1';
              }, 10);
            })(productCards[j]);
          } else {
            productCards[j].style.opacity = '0';
            (function(card) {
              setTimeout(function() {
                card.style.display = 'none';
              }, 300);
            })(productCards[j]);
          }
        }
      });
    }
  }

  // Setup scroll animations
  setupScrollAnimations() {
    function animateOnScroll() {
      var elements = document.querySelectorAll('.animate-on-scroll');
      var i;
      
      for (i = 0; i < elements.length; i++) {
        var elementTop = elements[i].getBoundingClientRect().top;
        var elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
          elements[i].classList.add('animated');
        }
      }
    }
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on page load
  }

  // Setup form handlers
  setupFormHandlers() {
    var self = this;
    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        var formData = new FormData(contactForm);
        var submitBtn = contactForm.querySelector('button[type="submit"]');
        var originalBtnText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        // Simulate API call (replace with actual API endpoint)
        setTimeout(function() {
          try {
            // Show success message
            self.showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            contactForm.reset();
          } catch (error) {
            self.showNotification('Failed to send message. Please try again later.', 'error');
          } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }
        }, 1500);
      });
    }
  }

  // Show notification
  showNotification(message, type) {
    type = type || 'info';
    var notification = document.createElement('div');
    notification.className = 'notification ' + type;
    notification.innerHTML = '<span class="notification-message">' + 
      message + 
      '</span><button class="notification-close">&times;</button>';
    
    document.body.appendChild(notification);
    
    // Auto-remove notification after 5 seconds
    setTimeout(function() {
      notification.classList.add('hide');
      setTimeout(function() {
        if (notification && notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 5000);
    
    // Close button handler
    var closeButton = notification.querySelector('.notification-close');
    if (closeButton) {
      closeButton.addEventListener('click', function() {
        notification.classList.add('hide');
        setTimeout(function() {
          if (notification && notification.parentNode) {
            notification.remove();
          }
        }, 300);
      });
    }
  }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  var app = new MaxwinApp();
  
  // Add page-loaded class when everything is fully loaded
  window.addEventListener('load', function() {
    document.body.classList.add('page-loaded');
  });
  
  // Handle keyboard navigation for better accessibility
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab' || e.key === 'Shift' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      document.documentElement.style.scrollBehavior = 'auto';
      setTimeout(function() {
        document.documentElement.style.scrollBehavior = 'smooth';
      }, 1000);
    }
  });
});