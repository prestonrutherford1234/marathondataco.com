/**
 * Marathon Current Website Redesign
 * Interactions and animations
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initScrollAnimations();
    initSmoothScroll();
    initLeadCapture();
    initCohortBadges();
});

/**
 * Dynamic cohort badge - updates based on current date
 * Q1 = Jan-Mar, Q2 = Apr-Jun, Q3 = Jul-Sep, Q4 = Oct-Dec
 */
function initCohortBadges() {
    const badges = document.querySelectorAll('.cohort-badge');
    if (!badges.length) return;
    
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const year = now.getFullYear();
    
    // Determine current quarter and show NEXT quarter (scarcity for upcoming cohort)
    let quarter, displayYear;
    if (month <= 2) {
        // Q1 (Jan-Mar) -> Show Q2
        quarter = 'Q2';
        displayYear = year;
    } else if (month <= 5) {
        // Q2 (Apr-Jun) -> Show Q3
        quarter = 'Q3';
        displayYear = year;
    } else if (month <= 8) {
        // Q3 (Jul-Sep) -> Show Q4
        quarter = 'Q4';
        displayYear = year;
    } else {
        // Q4 (Oct-Dec) -> Show Q1 next year
        quarter = 'Q1';
        displayYear = year + 1;
    }
    
    const cohortText = `${quarter} ${displayYear}`;
    badges.forEach(badge => {
        badge.textContent = cohortText;
    });
}

/**
 * Navbar scroll behavior
 */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScroll = 0;
    const scrollThreshold = 50;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        // Add scrolled class for background opacity
        if (currentScroll > scrollThreshold) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }, { passive: true });
}

/**
 * Mobile menu toggle
 */
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener('click', () => {
        const isActive = menuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active', isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';
    });

    // Close menu when clicking a link
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            menuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/**
 * Scroll-triggered animations using IntersectionObserver
 */
function initScrollAnimations() {
    // Elements to animate on scroll
    const animateElements = document.querySelectorAll(`
        .section-header,
        .problem-card,
        .stack-layer,
        .value-card,
        .timeline-step,
        .diff-card,
        .cta-content
    `);

    if (!animateElements.length) return;

    // Add animation class
    animateElements.forEach(el => {
        el.classList.add('animate-on-scroll');
    });

    // Create observer
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements
    animateElements.forEach(el => observer.observe(el));

    // Stagger grids
    const staggerContainers = document.querySelectorAll('.problems-grid, .stack-layers');
    staggerContainers.forEach(container => {
        container.classList.add('stagger-children');
    });

    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                staggerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    staggerContainers.forEach(el => staggerObserver.observe(el));
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            const navHeight = document.querySelector('.navbar')?.offsetHeight || 72;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
}

/**
 * Performance: Debounce helper
 */
function debounce(func, wait = 10) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// -------------------------------------------------------------------
// Lead Capture - Progressive Multi-Step Form (supports multiple instances)
// -------------------------------------------------------------------

const API_BASE = 'http://localhost:3300/api';

// Store form state per instance (hero vs footer)
const formInstances = {
    hero: {
        email: '',
        interests: [],
        problems: '',
        selectedSlot: null,
        slots: [],
        prefix: '' // Hero uses no prefix for backwards compatibility
    },
    footer: {
        email: '',
        interests: [],
        problems: '',
        selectedSlot: null,
        slots: [],
        prefix: 'footer'
    }
};

/**
 * Initialize lead capture forms (hero and footer)
 */
function initLeadCapture() {
    // Hero form (original)
    initFormInstance('hero', {
        emailForm: 'emailForm',
        questionsForm: 'questionsForm',
        bookBtn: 'bookBtn',
        emailInput: 'leadEmail',
        interestsGroup: 'interestsGroup',
        interestsName: 'interests',
        problemsInput: 'problems',
        slotsLoading: 'slotsLoading',
        slotsList: 'slotsList',
        confirmationText: 'confirmationText',
        confirmationMeeting: 'confirmationMeeting',
        stepPrefix: 'step'
    });

    // Footer form
    initFormInstance('footer', {
        emailForm: 'footerEmailForm',
        questionsForm: 'footerQuestionsForm',
        bookBtn: 'footerBookBtn',
        emailInput: 'footerLeadEmail',
        interestsGroup: 'footerInterestsGroup',
        interestsName: 'footerInterests',
        problemsInput: 'footerProblems',
        slotsLoading: 'footerSlotsLoading',
        slotsList: 'footerSlotsList',
        confirmationText: 'footerConfirmationText',
        confirmationMeeting: 'footerConfirmationMeeting',
        stepPrefix: 'footerStep'
    });
}

/**
 * Initialize a single form instance
 */
function initFormInstance(instanceKey, ids) {
    const emailForm = document.getElementById(ids.emailForm);
    const questionsForm = document.getElementById(ids.questionsForm);
    const bookBtn = document.getElementById(ids.bookBtn);

    if (emailForm) {
        emailForm.addEventListener('submit', (e) => handleEmailSubmit(e, instanceKey, ids));
    }

    if (questionsForm) {
        questionsForm.addEventListener('submit', (e) => handleQuestionsSubmit(e, instanceKey, ids));
    }

    if (bookBtn) {
        bookBtn.addEventListener('click', () => handleBookMeeting(instanceKey, ids));
    }
}

/**
 * Step 1: Handle email submission
 */
async function handleEmailSubmit(e, instanceKey, ids) {
    e.preventDefault();
    
    const emailInput = document.getElementById(ids.emailInput);
    const email = emailInput.value.trim();
    
    if (!email || !email.includes('@')) {
        shakeElement(emailInput);
        return;
    }
    
    // Store email in this instance's state
    formInstances[instanceKey].email = email;
    
    // Set button to loading
    const btn = e.target.querySelector('button');
    btn.classList.add('loading');
    
    try {
        // Submit email to API
        const response = await fetch(`${API_BASE}/lead/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        if (!response.ok) throw new Error('Failed to submit email');
        
        // Transition to step 2
        transitionToStep(2, ids.stepPrefix);
        
    } catch (error) {
        console.error('Error submitting email:', error);
        // Still transition - don't block user if API fails
        transitionToStep(2, ids.stepPrefix);
    } finally {
        btn.classList.remove('loading');
    }
}

/**
 * Step 2: Handle questions submission
 */
async function handleQuestionsSubmit(e, instanceKey, ids) {
    e.preventDefault();
    
    // Collect all checked interests for this instance
    const checkedBoxes = document.querySelectorAll(`#${ids.interestsGroup} input[name="${ids.interestsName}"]:checked`);
    const interests = Array.from(checkedBoxes).map(cb => cb.value);
    const problems = document.getElementById(ids.problemsInput).value.trim();
    
    formInstances[instanceKey].interests = interests;
    formInstances[instanceKey].problems = problems;
    
    const btn = e.target.querySelector('button');
    btn.classList.add('loading');
    
    try {
        // Submit questions to API
        await fetch(`${API_BASE}/lead/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: formInstances[instanceKey].email,
                interests,
                problems
            })
        });
    } catch (error) {
        console.error('Error submitting questions:', error);
        // Continue anyway
    }
    
    // Transition to step 3 and fetch slots
    transitionToStep(3, ids.stepPrefix);
    btn.classList.remove('loading');
    
    // Fetch available slots for this instance
    fetchAvailableSlots(instanceKey, ids);
}

/**
 * Fetch available calendar slots
 */
async function fetchAvailableSlots(instanceKey, ids) {
    const loadingEl = document.getElementById(ids.slotsLoading);
    const slotsListEl = document.getElementById(ids.slotsList);
    const bookBtn = document.getElementById(ids.bookBtn);
    
    try {
        const response = await fetch(`${API_BASE}/calendar/slots`);
        
        if (!response.ok) throw new Error('Failed to fetch slots');
        
        const data = await response.json();
        formInstances[instanceKey].slots = data.slots || [];
        
        // Hide loading, show slots
        loadingEl.classList.add('hidden');
        slotsListEl.classList.remove('hidden');
        
        if (formInstances[instanceKey].slots.length === 0) {
            slotsListEl.innerHTML = `
                <p class="no-slots">No available slots found. Please try again later or 
                <a href="mailto:preston@marathondataco.com">email us directly</a>.</p>
            `;
            return;
        }
        
        // Render slots with unique IDs per instance
        const slotPrefix = instanceKey === 'hero' ? 'slot' : 'footerSlot';
        slotsListEl.innerHTML = formInstances[instanceKey].slots.map((slot, index) => `
            <div class="slot-option" data-slot-id="${slot.id}">
                <input 
                    type="radio" 
                    name="${slotPrefix}Selection" 
                    id="${slotPrefix}${index}" 
                    value="${slot.id}"
                >
                <label for="${slotPrefix}${index}">${slot.display}</label>
            </div>
        `).join('');
        
        // Add click handlers
        slotsListEl.querySelectorAll('.slot-option').forEach(option => {
            option.addEventListener('click', () => {
                // Remove selected from all in this list
                slotsListEl.querySelectorAll('.slot-option').forEach(o => o.classList.remove('selected'));
                // Add selected to clicked
                option.classList.add('selected');
                // Check the radio
                option.querySelector('input').checked = true;
                // Store selection in this instance's state
                formInstances[instanceKey].selectedSlot = option.dataset.slotId;
                // Show book button
                bookBtn.classList.remove('hidden');
            });
        });
        
    } catch (error) {
        console.error('Error fetching slots:', error);
        loadingEl.innerHTML = `
            <p class="slots-error">Unable to load available times. 
            <a href="https://calendly.com/prestonr2/marathon-demo-with-preston" target="_blank" class="calendly-link">Book via Calendly</a> to schedule.</p>
        `;
    }
}

/**
 * Step 3: Handle meeting booking
 */
async function handleBookMeeting(instanceKey, ids) {
    if (!formInstances[instanceKey].selectedSlot) return;
    
    const bookBtn = document.getElementById(ids.bookBtn);
    bookBtn.classList.add('loading');
    
    try {
        const response = await fetch(`${API_BASE}/calendar/book`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: formInstances[instanceKey].email,
                slotId: formInstances[instanceKey].selectedSlot
            })
        });
        
        if (!response.ok) throw new Error('Failed to book meeting');
        
        const data = await response.json();
        
        // Show confirmation
        const confirmationText = document.getElementById(ids.confirmationText);
        const confirmationMeeting = document.getElementById(ids.confirmationMeeting);
        
        confirmationText.textContent = `Check ${formInstances[instanceKey].email} for the calendar invite with Google Meet link.`;
        
        // Format the meeting time
        const meetingTime = new Date(data.meeting.time).toLocaleString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short'
        });
        confirmationMeeting.textContent = meetingTime;
        
        transitionToStep(4, ids.stepPrefix);
        
    } catch (error) {
        console.error('Error booking meeting:', error);
        alert('Sorry, something went wrong. Please try again or email us directly.');
    } finally {
        bookBtn.classList.remove('loading');
    }
}

/**
 * Transition between form steps with smooth animation
 * @param {number} stepNumber - The step to transition to
 * @param {string} stepPrefix - The ID prefix for steps ('step' for hero, 'footerStep' for footer)
 */
function transitionToStep(stepNumber, stepPrefix = 'step') {
    // Find the container for this form instance
    const container = stepPrefix === 'step' 
        ? document.getElementById('leadCapture')
        : document.getElementById('footerLeadCapture');
    
    if (!container) return;
    
    const allSteps = container.querySelectorAll('.lead-step');
    
    // Hide all steps in this container
    allSteps.forEach(step => {
        if (!step.classList.contains('hidden')) {
            step.style.opacity = '0';
            step.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                step.classList.add('hidden');
                step.style.opacity = '';
                step.style.transform = '';
            }, 200);
        }
    });
    
    // Show target step after brief delay
    setTimeout(() => {
        const targetStep = document.getElementById(`${stepPrefix}${stepNumber}`);
        if (targetStep) {
            targetStep.classList.remove('hidden');
            targetStep.style.opacity = '0';
            targetStep.style.transform = 'translateY(10px)';
            
            // Trigger reflow
            targetStep.offsetHeight;
            
            targetStep.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            targetStep.style.opacity = '1';
            targetStep.style.transform = 'translateY(0)';
        }
    }, 250);
}

/**
 * Shake element for validation feedback
 */
function shakeElement(element) {
    element.style.animation = 'shake 0.4s ease';
    setTimeout(() => {
        element.style.animation = '';
    }, 400);
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-8px); }
        50% { transform: translateX(8px); }
        75% { transform: translateX(-8px); }
    }
`;
document.head.appendChild(style);
