// JavaScript for Audio Spectrum Visualizer website

document.addEventListener('DOMContentLoaded', function() {
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Offset for header
          behavior: 'smooth'
        });
      }
    });
  });

  // Mobile menu toggle
  const mobileMenuButton = document.querySelector('.mobile-menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Download form submission
  const downloadForm = document.querySelector('#download-form');
  if (downloadForm) {
    downloadForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = document.querySelector('#name').value;
      const email = document.querySelector('#email').value;
      
      if (!name || !email) {
        alert('Please fill in all fields');
        return;
      }
      
      // In a real implementation, you would send this data to your server
      // For now, we'll just simulate a successful submission
      
      // Store user info in localStorage
      localStorage.setItem('user_name', name);
      localStorage.setItem('user_email', email);
      
      // Redirect to the appropriate download based on detected OS
      const os = detectOperatingSystem();
      let downloadUrl = '';
      
      switch(os) {
        case 'Windows':
          downloadUrl = 'downloads/AudioSpectrumVisualizer-Windows.exe';
          break;
        case 'macOS':
          downloadUrl = 'downloads/AudioSpectrumVisualizer-Mac.dmg';
          break;
        case 'Linux':
          downloadUrl = 'downloads/AudioSpectrumVisualizer-Linux.AppImage';
          break;
        default:
          downloadUrl = '#download'; // Fallback to download section
      }
      
      // Show thank you message
      alert('Thank you for downloading Audio Spectrum Visualizer! Your download will begin shortly.');
      
      // Start download
      setTimeout(() => {
        window.location.href = downloadUrl;
      }, 1000);
    });
  }

  // Detect user's operating system
  function detectOperatingSystem() {
    const userAgent = window.navigator.userAgent;
    let os = 'Unknown';
    
    if (userAgent.indexOf('Windows') !== -1) {
      os = 'Windows';
    } else if (userAgent.indexOf('Mac') !== -1) {
      os = 'macOS';
    } else if (userAgent.indexOf('Linux') !== -1) {
      os = 'Linux';
    }
    
    return os;
  }

  // Highlight the download button for the user's OS
  const userOS = detectOperatingSystem();
  const osDownloadButtons = document.querySelectorAll('.os-download');
  
  osDownloadButtons.forEach(button => {
    if (button.getAttribute('data-os') === userOS) {
      button.classList.add('bg-purple-100');
      button.classList.add('border-purple-500');
    }
  });

  // Animate elements when they come into view
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  animatedElements.forEach(element => {
    observer.observe(element);
  });

  // Pricing toggle
  const pricingToggle = document.querySelector('#pricing-toggle');
  const monthlyPrices = document.querySelectorAll('.monthly-price');
  const yearlyPrices = document.querySelectorAll('.yearly-price');
  
  if (pricingToggle) {
    pricingToggle.addEventListener('change', function() {
      if (this.checked) {
        // Show yearly prices
        monthlyPrices.forEach(el => el.classList.add('hidden'));
        yearlyPrices.forEach(el => el.classList.remove('hidden'));
      } else {
        // Show monthly prices
        monthlyPrices.forEach(el => el.classList.remove('hidden'));
        yearlyPrices.forEach(el => el.classList.add('hidden'));
      }
    });
  }

  // FAQ accordion
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
      const answer = this.nextElementSibling;
      const icon = this.querySelector('.faq-icon');
      
      // Toggle answer visibility
      answer.classList.toggle('hidden');
      
      // Toggle icon
      if (icon) {
        icon.classList.toggle('transform');
        icon.classList.toggle('rotate-180');
      }
    });
  });

  // Testimonial slider
  let currentTestimonial = 0;
  const testimonials = document.querySelectorAll('.testimonial');
  const testimonialDots = document.querySelectorAll('.testimonial-dot');
  
  function showTestimonial(index) {
    testimonials.forEach((testimonial, i) => {
      testimonial.classList.toggle('hidden', i !== index);
    });
    
    testimonialDots.forEach((dot, i) => {
      dot.classList.toggle('bg-purple-600', i === index);
      dot.classList.toggle('bg-gray-300', i !== index);
    });
    
    currentTestimonial = index;
  }
  
  // Initialize testimonial slider
  if (testimonials.length > 0 && testimonialDots.length > 0) {
    showTestimonial(0);
    
    // Add click event to dots
    testimonialDots.forEach((dot, i) => {
      dot.addEventListener('click', () => showTestimonial(i));
    });
    
    // Auto-rotate testimonials
    setInterval(() => {
      const nextIndex = (currentTestimonial + 1) % testimonials.length;
      showTestimonial(nextIndex);
    }, 5000);
  }
});