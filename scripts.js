document.addEventListener('DOMContentLoaded', () => {
    // Function to load HTML files via fetch
    async function loadComponent(elementId, filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`Failed to load ${filePath}`);
            const html = await response.text();
            document.getElementById(elementId).innerHTML = html;
            return true;
        } catch (error) {
            console.error(`Error loading ${filePath}:`, error);
            return false;
        }
    }

    // Load all components in sequence
    async function loadAllComponents() {
        await loadComponent('nav-container', 'nav.html');
        await loadComponent('body-container', 'body.html');
        await loadComponent('footer-container', 'footer.html');
        
        // After all components are loaded, initialize functionality
        initializePage();
    }

    function initializePage() {
        // Section navigation
        const sections = {
            home: document.getElementById('home-section'),
            work: document.getElementById('work-section'),
            about: document.getElementById('about-section'),
            certificates: document.getElementById('certificates-section'),
            contact: document.getElementById('contact-section')
        };

        function activateSection(sectionId) {
            Object.values(sections).forEach(section => {
                if (section) {
                    section.classList.remove('active-section');
                    section.classList.add('section-block');
                }
            });
            const target = sections[sectionId];
            if (target) target.classList.add('active-section');
            
            const navBtns = document.querySelectorAll('.nav-btn');
            navBtns.forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-section') === sectionId) btn.classList.add('active');
            });
        }

        // Nav button event listeners
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const sectionName = btn.getAttribute('data-section');
                if (sectionName && sections[sectionName]) activateSection(sectionName);
            });
        });

        // Button handlers
        const contactMeBtn = document.getElementById('contactMeBtn');
        const viewProjectsBtn = document.getElementById('viewProjectsBtn');
        const seeAllGithub = document.getElementById('seeAllGithub');

        if (contactMeBtn) contactMeBtn.addEventListener('click', () => activateSection('contact'));
        if (viewProjectsBtn) viewProjectsBtn.addEventListener('click', () => activateSection('work'));
        if (seeAllGithub) {
            seeAllGithub.addEventListener('click', (e) => {
                e.preventDefault();
                alert('🔗 GitHub portfolio: https://github.com/lourd-mallo (demo)');
            });
        }

        // Click-to-Reveal Definition Effect
        const clickableCards = document.querySelectorAll('.clickable-card');
        clickableCards.forEach(card => {
            const definitionText = card.getAttribute('data-definition');
            const overlayDiv = card.querySelector('.definition-overlay');
            if (definitionText && overlayDiv) {
                overlayDiv.innerHTML = definitionText;
                card.addEventListener('click', (e) => {
                    if (e.target.tagName === 'A' || e.target.closest('a')) return;
                    document.querySelectorAll('.definition-overlay.show').forEach(openOverlay => {
                        if (openOverlay !== overlayDiv) openOverlay.classList.remove('show');
                    });
                    overlayDiv.classList.toggle('show');
                });
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.clickable-card')) {
                document.querySelectorAll('.definition-overlay.show').forEach(overlay => {
                    overlay.classList.remove('show');
                });
            }
        });

        // Contact Form Handler
        const messageForm = document.getElementById('messageForm');
        const formFeedback = document.getElementById('formFeedback');
        
        if (messageForm) {
            messageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('senderName')?.value.trim();
                const email = document.getElementById('senderEmail')?.value.trim();
                const message = document.getElementById('messageContent')?.value.trim();
                
                if (!name || !email || !message) {
                    if (formFeedback) {
                        formFeedback.className = 'form-message error';
                        formFeedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please fill in all required fields.';
                        setTimeout(() => formFeedback.style.display = 'none', 3000);
                    }
                    return;
                }
                
                if (!email.includes('@') || !email.includes('.')) {
                    if (formFeedback) {
                        formFeedback.className = 'form-message error';
                        formFeedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please enter a valid email address.';
                        setTimeout(() => formFeedback.style.display = 'none', 3000);
                    }
                    return;
                }
                
                if (formFeedback) {
                    formFeedback.className = 'form-message success';
                    formFeedback.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! Your message has been sent.';
                    messageForm.reset();
                    setTimeout(() => formFeedback.style.display = 'none', 4000);
                }
            });
        }

        // Search functionality
        const searchInput = document.getElementById('globalSearchInput');
        const resultsDropdown = document.getElementById('searchResultsDropdown');
        
        function getAllSearchableItems() {
            const items = [];
            document.querySelectorAll('.project-card, .cert-card, .info-item, .testimonial-card').forEach(el => {
                let title = '', description = '';
                if (el.classList.contains('project-card')) {
                    const titleEl = el.querySelector('h3');
                    title = titleEl ? titleEl.innerText : '';
                    const descEl = el.querySelector('p');
                    description = descEl ? descEl.innerText : '';
                } else if (el.classList.contains('cert-card')) {
                    const titleEl = el.querySelector('h4');
                    title = titleEl ? titleEl.innerText : '';
                    description = Array.from(el.querySelectorAll('p')).map(p => p.innerText).join(' ');
                } else if (el.classList.contains('testimonial-card')) {
                    const textEl = el.querySelector('.testimonial-text');
                    title = 'Testimonial';
                    description = textEl ? textEl.innerText : '';
                } else {
                    title = el.innerText.trim();
                    description = title;
                }
                const fullText = `${title} ${description}`.toLowerCase();
                items.push({ element: el, title: title.length > 40 ? title.substring(0,40)+'...' : title, fullText });
            });
            items.push({ element: null, title: 'About Me Section', fullText: 'about me ui ux designer game development', sectionId: 'about' });
            items.push({ element: null, title: 'Certificates', fullText: 'certificates achievement awards', sectionId: 'certificates' });
            return items;
        }
        
        function performSearch(query) {
            if (!query.trim()) { if(resultsDropdown) resultsDropdown.classList.remove('show'); return; }
            const matches = getAllSearchableItems().filter(item => item.fullText.includes(query.toLowerCase()));
            if (!resultsDropdown) return;
            
            if (matches.length === 0) {
                resultsDropdown.innerHTML = '<div class="no-results"><i class="fas fa-search-minus"></i> No results</div>';
                resultsDropdown.classList.add('show');
                return;
            }
            
            resultsDropdown.innerHTML = '';
            matches.slice(0, 6).forEach(match => {
                const div = document.createElement('div');
                div.className = 'search-result-item';
                div.innerHTML = `<h4><i class="fas fa-arrow-right"></i> ${match.title.substring(0, 45)}</h4><p>Click to view</p>`;
                div.addEventListener('click', () => {
                    if (match.sectionId && sections[match.sectionId]) {
                        activateSection(match.sectionId);
                    } else if (match.element) {
                        match.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        match.element.style.backgroundColor = '#e0ecff';
                        setTimeout(() => { if(match.element) match.element.style.backgroundColor = ''; }, 1500);
                    }
                    resultsDropdown.classList.remove('show');
                    if(searchInput) searchInput.value = '';
                });
                resultsDropdown.appendChild(div);
            });
            resultsDropdown.classList.add('show');
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => performSearch(e.target.value));
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && resultsDropdown && !resultsDropdown.contains(e.target)) {
                    resultsDropdown.classList.remove('show');
                }
            });
        }

        // Social links handler
        const socialLinks = document.querySelectorAll('.footer-social a, .social-links a');
        socialLinks.forEach(icon => {
            icon.addEventListener('click', (e) => { e.preventDefault(); alert('🌐 Connect with Lourd Chrysler'); });
        });

        // Update copyright year
        const yearSpan = document.querySelector('.copyright');
        if (yearSpan) yearSpan.innerText = yearSpan.innerText.replace('2025', new Date().getFullYear());
        
        // Set default active section if needed
        if (sections.home && !document.querySelector('.section-block.active-section')) {
            activateSection('home');
        }
    }

    // Start loading all components
    loadAllComponents();
});