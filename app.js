/* ==========================================================================
   LINK MOVERS - INTERACTIVE SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. MOBILE NAVBAR & STICKY HEADER
  // ==========================================
  const mainHeader = document.getElementById('home');
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  // Sticky navbar logic
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      mainHeader.classList.add('scrolled');
    } else {
      mainHeader.classList.remove('scrolled');
    }
  });

  // Toggle mobile navigation
  menuToggle.addEventListener('click', () => {
    mobileNav.classList.toggle('active');
    menuToggle.classList.toggle('active');

    // Animate bars to X shape on toggle
    const bars = menuToggle.querySelectorAll('.bar');
    if (menuToggle.classList.contains('active')) {
      bars[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
      bars[1].style.opacity = '0';
      bars[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
    } else {
      bars[0].style.transform = 'none';
      bars[1].style.opacity = '1';
      bars[2].style.transform = 'none';
    }
  });

  // Close mobile nav when clicking a link
  const closeMobileMenu = () => {
    mobileNav.classList.remove('active');
    menuToggle.classList.remove('active');
    const bars = menuToggle.querySelectorAll('.bar');
    bars[0].style.transform = 'none';
    bars[1].style.opacity = '1';
    bars[2].style.transform = 'none';
  };

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // ==========================================
  // 2. SCROLL SPY - ACTIVE LINK HIGHLIGHT
  // ==========================================
  const sections = document.querySelectorAll('section, header');

  const scrollSpy = () => {
    const scrollPos = window.scrollY + 120; // offset for nav height

    sections.forEach(section => {
      if (section.id) {
        const top = section.offsetTop;
        const height = section.offsetHeight;

        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${section.id}`) {
              link.classList.add('active');
            }
          });
        }
      }
    });
  };
  window.addEventListener('scroll', scrollSpy);

  // ==========================================
  // 3. STATS COUNT-UP ANIMATION
  // ==========================================
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  const animateStats = () => {
    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'), 10);
      const count = +stat.innerText;
      // Define step speed based on target size
      const speed = target / 60;

      const updateCount = () => {
        const current = parseInt(stat.innerText.replace(/,/g, ''), 10) || 0;
        const increment = Math.ceil(speed);

        if (current < target) {
          const newVal = current + increment > target ? target : current + increment;
          stat.innerText = newVal.toLocaleString();
          setTimeout(updateCount, 25);
        } else {
          stat.innerText = target.toLocaleString();
        }
      };
      updateCount();
    });
  };

  // Intersection Observer for counting stats in view
  const statsSection = document.querySelector('.stats-banner');
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
          animateStats();
          statsAnimated = true;
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(statsSection);
  }

  // ==========================================
  // 4. INTELLIGENT QUOTE ESTIMATOR DATABASE
  // ==========================================

  // Distance Database (in km) between major hubs
  const distances = {
    'karachi-lahore': 1210, 'lahore-karachi': 1210,
    'karachi-islamabad': 1410, 'islamabad-karachi': 1410,
    'karachi-faisalabad': 1130, 'faisalabad-karachi': 1130,
    'karachi-peshawar': 1560, 'peshawar-karachi': 1560,
    'karachi-multan': 890, 'multan-karachi': 890,
    'karachi-quetta': 690, 'quetta-karachi': 690,
    'lahore-islamabad': 380, 'islamabad-lahore': 380,
    'lahore-faisalabad': 180, 'faisalabad-lahore': 180,
    'lahore-peshawar': 510, 'peshawar-lahore': 510,
    'lahore-multan': 350, 'multan-lahore': 350,
    'lahore-quetta': 1010, 'quetta-lahore': 1010,
    'islamabad-faisalabad': 320, 'faisalabad-islamabad': 320,
    'islamabad-peshawar': 180, 'peshawar-islamabad': 180,
    'islamabad-multan': 630, 'multan-islamabad': 630,
    'islamabad-quetta': 930, 'quetta-islamabad': 930,
    'faisalabad-peshawar': 480, 'peshawar-faisalabad': 480,
    'faisalabad-multan': 240, 'multan-faisalabad': 240,
    'faisalabad-quetta': 840, 'quetta-faisalabad': 840,
    'peshawar-multan': 760, 'multan-peshawar': 760,
    'peshawar-quetta': 910, 'quetta-peshawar': 910,
    'multan-quetta': 620, 'quetta-multan': 620
  };

  // State
  let currentMovementType = 'up-country'; // default active tab

  // Elements
  const tabButtons = document.querySelectorAll('.calc-tab');
  const originSelect = document.getElementById('origin');
  const destinationSelect = document.getElementById('destination');
  const weightInput = document.getElementById('weight');
  const cargoTypeSelect = document.getElementById('cargoType');

  const estDistanceEl = document.getElementById('estDistance');
  const estTimeEl = document.getElementById('estTime');
  const estCostEl = document.getElementById('estCost');
  const quoteForm = document.getElementById('quoteForm');

  // Tab switching logic
  tabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      currentMovementType = button.getAttribute('data-type');

      // Customize selections according to mode
      if (currentMovementType === 'local') {
        // If local movements, origin and destination must align
        destinationSelect.value = originSelect.value;
        destinationSelect.disabled = true;
      } else {
        destinationSelect.disabled = false;
        if (originSelect.value === destinationSelect.value) {
          // force a different default destination
          const firstDiffOpt = Array.from(destinationSelect.options).find(opt => opt.value !== originSelect.value);
          if (firstDiffOpt) destinationSelect.value = firstDiffOpt.value;
        }
      }

      calculateQuote();
    });
  });

  // Calculate logic
  const calculateQuote = () => {
    const origin = originSelect.value;
    const destination = destinationSelect.value;
    const weight = parseFloat(weightInput.value) || 1;
    const category = cargoTypeSelect.value;

    let distance = 0;
    let baseRatePerTonKm = 10;
    let handlingFee = 5000;
    let categoryMultiplier = 1.0;

    // Set category multipliers
    switch (category) {
      case 'fragile': categoryMultiplier = 1.25; break;
      case 'refrigerated': categoryMultiplier = 1.5; break;
      case 'hazard': categoryMultiplier = 1.4; break;
      default: categoryMultiplier = 1.0;
    }

    // Determine distance based on service type
    if (currentMovementType === 'local') {
      distance = 35; // average intra-city loop
      baseRatePerTonKm = 40; // local higher base rate per km
      handlingFee = 3000;
    } else {
      const key = `${origin}-${destination}`;
      distance = distances[key] || 35; // fallback

      if (currentMovementType === 'bulk') {
        baseRatePerTonKm = 8; // Bulk discounts
        handlingFee = 12000; // bulk container handling
      } else if (currentMovementType === 'bonded') {
        baseRatePerTonKm = 14; // Premium security/seals
        handlingFee = 25000; // custom clearance consulting fee
      } else {
        // Up country
        baseRatePerTonKm = 11;
        handlingFee = 8000;
      }
    }

    // Cost Calculation
    const routeCost = distance * baseRatePerTonKm * weight;
    const totalCost = Math.round((routeCost + handlingFee) * categoryMultiplier);

    // Transit time estimation
    let transitHours = Math.round(distance / 50); // average truck speed with buffer
    let timeText = "";
    if (currentMovementType === 'local') {
      timeText = "Same Day (4 - 6 Hours)";
    } else {
      if (transitHours < 6) transitHours = 6;
      const minHours = Math.max(4, transitHours - 4);
      const maxHours = transitHours + 8;
      timeText = `${minHours} - ${maxHours} Hours`;
    }

    // Update UI elements safely
    if (estTimeEl) estTimeEl.innerText = timeText;
    if (estDistanceEl) estDistanceEl.innerText = `${distance.toLocaleString()} km`;
    if (estCostEl) estCostEl.innerText = `PKR ${totalCost.toLocaleString()}`;

    return {
      distance,
      totalCost,
      time: timeText
    };
  };

  // Add event listeners for calculator updates
  [originSelect, destinationSelect, weightInput, cargoTypeSelect].forEach(element => {
    element.addEventListener('change', calculateQuote);
  });
  weightInput.addEventListener('input', calculateQuote);

  // Initialize display on load
  calculateQuote();


  // ==========================================
  // 5. BOOKING FORM & CONFIRMATION MODAL
  // ==========================================
  const confirmModal = document.getElementById('confirmModal');
  const modalClose = document.getElementById('modalClose');
  const modalDoneBtn = document.getElementById('modalDoneBtn');
  const modalCustomerName = document.getElementById('modalCustomerName');
  const recTracking = document.getElementById('recTracking');
  const recService = document.getElementById('recService');
  const recRoute = document.getElementById('recRoute');
  const recWeight = document.getElementById('recWeight');
  const recCost = document.getElementById('recCost');
  const modalWhatsAppLink = document.getElementById('modalWhatsAppLink');
  const modalSmsLink = document.getElementById('modalSmsLink'); // Added SMS link element

  // Submit Booking Form
  quoteForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const customerName = document.getElementById('bookName').value.trim();
    const customerPhone = document.getElementById('bookPhone').value.trim();
    const originCity = originSelect.options[originSelect.selectedIndex].text;
    const destCity = destinationSelect.options[destinationSelect.selectedIndex].text;
    const weight = weightInput.value;

    const quote = calculateQuote();

    // Map service title name
    let serviceTitle = 'Up Country Movement';
    if (currentMovementType === 'bulk') serviceTitle = 'Bulk Movement';
    if (currentMovementType === 'bonded') serviceTitle = 'Bonded Movement';
    if (currentMovementType === 'local') serviceTitle = 'Local Movement';

    // Generate random tracking code
    const randomTrack = `LM-${Math.floor(10000 + Math.random() * 90000)}-PAK`;

    // Fill Modal Data
    if (modalCustomerName) modalCustomerName.innerText = customerName;
    if (recTracking) recTracking.innerText = randomTrack;
    if (recService) recService.innerText = serviceTitle;
    if (recRoute) recRoute.innerText = currentMovementType === 'local' ? `${originCity} Local` : `${originCity} to ${destCity}`;
    if (recWeight) recWeight.innerText = `${weight} Tons`;
    if (recCost) recCost.innerText = `PKR ${quote.totalCost.toLocaleString()}`;

    // Create Pre-filled Message Text
    const textMsg = `Hello Link Movers,\n\nI want to confirm my logistics booking details:\n` +
      `- *Tracking ID:* ${randomTrack}\n` +
      `- *Client Name:* ${customerName}\n` +
      `- *Phone:* ${customerPhone}\n` +
      `- *Service Type:* ${serviceTitle}\n` +
      `- *Route:* ${currentMovementType === 'local' ? `${originCity} Local` : `${originCity} to${destCity}`}\n` +
      `- *Cargo Weight:* ${weight} Tons\n` +
      `Please confirm the container allocation and truck dispatch. Thanks!`;

    const encodedMsg = encodeURIComponent(textMsg);

    // Target WhatsApp & SMS links (Number: 03132592940 -> +923132592940)
    const waUrl = `https://wa.me/923132592940?text=${encodedMsg}`;

    // Cross-platform SMS URL format (using ? or & based on standard mobile OS compatibility)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const smsUrl = `sms:+923132592940${isIOS ? '&' : '?'}body=${encodedMsg}`;

    // Set WhatsApp Link
    if (modalWhatsAppLink) {
      modalWhatsAppLink.setAttribute('href', waUrl);
      modalWhatsAppLink.setAttribute('target', '_blank');
      modalWhatsAppLink.setAttribute('rel', 'noopener noreferrer');
    }

    // Set SMS Link
    if (modalSmsLink) {
      modalSmsLink.setAttribute('href', smsUrl);
    }

    // Step 1: Display modal preview directly on the webpage
    if (confirmModal) confirmModal.classList.add('active');
  });

  // Modal closing event handlers
  const closeModal = () => {
    if (confirmModal) confirmModal.classList.remove('active');
    quoteForm.reset();
    if (typeof calculateQuote === 'function') calculateQuote();
  };

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalDoneBtn) modalDoneBtn.addEventListener('click', closeModal);
  if (confirmModal) {
    confirmModal.addEventListener('click', (e) => {
      if (e.target === confirmModal) {
        closeModal();
      }
    });
  }

  // ==========================================
  // 6. CONTACT FORM SUBMISSION WITH CLIENT SELECTOR
  // ==========================================
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contactName').value.trim();
      const userEmail = document.getElementById('contactEmail').value.trim();
      const subjectSelect = document.getElementById('contactSubject');
      const subjectText = subjectSelect ? subjectSelect.options[subjectSelect.selectedIndex].text : 'Logistics Enquiry';
      const message = document.getElementById('contactMessage').value.trim();

      const targetEmail = 'linkmovers@gmail.com';
      const emailSubject = `Link Movers Enquiry: ${subjectText} - ${name}`;
      const emailBody = `New Logistics Inquiry from Link Movers Website:\n\n` +
        `• Name: ${name}\n` +
        `• Customer Email: ${userEmail}\n` +
        `• Subject / Service: ${subjectText}\n\n` +
        `Cargo Specifications / Message:\n${message}\n\n` +
        `Sent via Link Movers Web Contact Form`;

      const encSubject = encodeURIComponent(emailSubject);
      const encBody = encodeURIComponent(emailBody);

      // Dynamic webmail endpoints & default mailto URL
      const emailUrls = {
        default: `mailto:${targetEmail}?subject=${encSubject}&body=${encBody}`,
        gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${targetEmail}&su=${encSubject}&body=${encBody}`,
        outlook: `https://outlook.live.com/mail/0/deeplink/compose?to=${targetEmail}&subject=${encSubject}&body=${encBody}`,
        yahoo: `https://compose.mail.yahoo.com/?to=${targetEmail}&subject=${encSubject}&body=${encBody}`
      };

      // Ask the user which client they want to use
      openEmailSelector(emailUrls);
    });
  }

  function openEmailSelector(urls) {
    // Simple prompt choice (or replace with a custom HTML modal)
    const choice = prompt(
      "How would you like to send your email?\n\n" +
      "1. Default Mail App (Apple Mail, Outlook Desktop, Mobile)\n" +
      "2. Gmail (Web)\n" +
      "3. Outlook / Hotmail (Web)\n" +
      "4. Yahoo Mail (Web)\n\n" +
      "Enter a number (1-4):"
    );

    switch (choice) {
      case '1':
        window.location.href = urls.default;
        break;
      case '2':
        window.open(urls.gmail, '_blank');
        break;
      case '3':
        window.open(urls.outlook, '_blank');
        break;
      case '4':
        window.open(urls.yahoo, '_blank');
        break;
      default:
        if (choice !== null) alert("Invalid choice. Please try again.");
        break;
    }


    // Construct mailto link
    const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    // Trigger user's mail client with pre-filled content
    window.location.href = mailtoUrl;

    // Provide clear feedback
    alert(`Thank you, ${name}! Your enquiry details have been pre-filled. Opening your email app to send the message to ${targetEmail}.`);
    contactForm.reset();
  };

  // ==========================================
  // 7. SCROLL TO TOP BUTTON
  // ==========================================
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  if (scrollTopBtn) {
    const handleScrollTopVisibility = () => {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    };

    window.addEventListener('scroll', handleScrollTopVisibility);

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ==========================================
  // 8. SMOOTH SCROLL NAVIGATION FOR HOME & FEATURE BUTTONS
  // ==========================================
  const allAnchorLinks = document.querySelectorAll('a[href^="#"]');

  allAnchorLinks.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();

        // Calculate offset position taking sticky header height into account
        const headerHeight = mainHeader ? mainHeader.offsetHeight : 70;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = (targetId === '#home')
          ? 0
          : (elementPosition + window.pageYOffset - headerHeight);

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Push state for clean navigation
        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
      }
    });
  });

});
