document.addEventListener('DOMContentLoaded', function() { 

    // Ana kategorileri yönetme

    document.querySelectorAll('.category-header').forEach(function(header) {

        header.addEventListener('click', function() {

            const categoryId = this.getAttribute('data-target');

            const content = document.querySelector(categoryId);

            const arrow = this.querySelector('.category-arrow');

            

            // Diğer açık kategorileri kapat

            document.querySelectorAll('.category-content').forEach(function(item) {

                if (item !== content && item.classList.contains('show')) {

                    item.classList.remove('show');

                    const otherArrow = item.previousElementSibling.querySelector('.category-arrow');

                    if (otherArrow) {

                        otherArrow.style.transform = 'rotate(0deg)';

                    }

                }

            });



            // Seçili kategoriyi aç/kapat

            if (content) {

                content.classList.toggle('show');

                if (arrow) {

                    arrow.style.transform = content.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';

                }

            }

        });

    });



    // Alt kategori içeriğini gösterme

    document.querySelectorAll('.subcategory-trigger').forEach(function(trigger) {

        trigger.addEventListener('click', async function(e) {

            e.stopPropagation(); // Ana kategorinin kapanmasını engelle

            

            const contentId = this.getAttribute('data-content');

            

            // Var olan içerik popuplarını kaldır

            document.querySelectorAll('.subcategory-popup').forEach(function(popup) {

                popup.remove();

            });



            // Yeni içerik popupı oluştur

            const popup = document.createElement('div');

            popup.className = 'subcategory-popup';



            // Show loading state first

            const loadingTemplate = document.getElementById('loading-template');

            if (loadingTemplate) {

                popup.appendChild(loadingTemplate.content.cloneNode(true));

            }



            // Add popup to page immediately with loading state

            document.body.appendChild(popup);

            setTimeout(() => popup.classList.add('show'), 10);



            try {
                // Simulate a loading delay. Replace this with a fetch from
                // data.json or a backend API to load real subcategory content.
                await new Promise(resolve => setTimeout(resolve, 1500));


                // Get and clone the content template

                const contentTemplate = document.getElementById('subcategory-content-template');

                const content = contentTemplate.content.cloneNode(true);



                // Update content with actual data

                const title = content.querySelector('h3');

                const body = content.querySelector('.popup-body');

                

                // Insert the selected subcategory title and placeholder text.
                // Real content should be loaded here from the server or JSON.
                title.textContent = this.querySelector('span').textContent;
                body.innerHTML = `
                    <p>Bu bölüm henüz yapım aşamasındadır. Yakında yayında olacaktır.</p>
                    <p>Lütfen daha sonra tekrar deneyiniz.</p>
                `;


                // Replace loading state with actual content

                popup.innerHTML = '';

                popup.appendChild(content);



                // Add close button functionality

                const closeBtn = popup.querySelector('.popup-close');

                if (closeBtn) {

                    closeBtn.addEventListener('click', () => popup.remove());

                }



            } catch (error) {

                console.error('İçerik yüklenirken hata oluştu:', error);

                popup.innerHTML = `

                    <div class="popup-content">

                        <div class="popup-header">

                            <h3>Hata</h3>

                            <button class="popup-close" onclick="this.closest('.subcategory-popup').remove()">

                                <i class="fas fa-times"></i>

                            </button>

                        </div>

                        <div class="popup-body">

                            <p>İçerik yüklenirken bir hata oluştu. Lütfen tekrar deneyiniz.</p>

                        </div>

                    </div>

                `;

            }



            // ESC tuşu ile kapatma

            document.addEventListener('keydown', function(event) {

                if (event.key === 'Escape') {

                    popup.remove();

                }

            });



            // Popup dışına tıklama ile kapatma

            document.addEventListener('click', function(event) {

                if (!popup.contains(event.target) && !trigger.contains(event.target)) {

                    popup.remove();

                }

            });        });

    });
});

// Değişkenler
let therapistData = null;

let selectedTherapist = null;

let selectedSession = null;



// News data

let newsData = null;



// Load therapist data

async function loadTherapistData() {

    try {

        const response = await fetch('data.json');

        therapistData = await response.json();

    } catch (error) {

        console.error('Terapist verileri yüklenemedi:', error);

    }

}



// Therapist selection modal

async function selectTherapist(type) {

    if (!therapistData) {

        await loadTherapistData();

    }



    const therapists = therapistData.terapistler[type];

    const therapistList = document.getElementById('therapistList');

    const modal = new bootstrap.Modal(document.getElementById('therapistModal'));



    // Clear therapist list

    therapistList.innerHTML = '';



    // List therapists

    therapists.forEach(therapist => {

        const therapistCard = createTherapistCard(therapist);

        therapistList.appendChild(therapistCard);

    });



    modal.show();

}



// Create therapist card

function createTherapistCard(therapist) {

    const div = document.createElement('div');

    div.className = 'therapist-card-modal';

    

    let expertiseBadges = therapist.uzmanlikAlanlari

        .map(exp => `<span class="expertise-badge">${exp}</span>`)

        .join('');



    let educationList = therapist.egitim

        .map(edu => `<li><i class="fas fa-graduation-cap"></i> ${edu}</li>`)

        .join('');



    let certificationList = therapist.sertifikalar

        .map(cert => `<li><i class="fas fa-certificate"></i> ${cert}</li>`)

        .join('');



    let sessionOptions = therapist.seanslar

        .map((session, index) => `

            <div class="session-option" onclick="selectSession('${therapist.id}', ${index})">

                <h5>${session.tip}</h5>

                <div class="price">${session.ucret} TL</div>

                <div class="duration">${session.sure}</div>

            </div>

        `).join('');



    div.innerHTML = `

        <div class="therapist-header">

            <img src="${therapist.foto}" alt="${therapist.isim}" class="therapist-photo">

            <div class="therapist-info">

                <h4>${therapist.isim}</h4>

                <p class="title">${therapist.unvan}</p>

                <p class="experience"><i class="fas fa-clock"></i> ${therapist.deneyim} deneyim</p>

            </div>

        </div>

        <div class="expertise-badges">

            ${expertiseBadges}

        </div>

        <div class="education-list">

            <h5><i class="fas fa-university"></i> Eğitim</h5>

            <ul>

                ${educationList}

            </ul>

        </div>

        <div class="certification-list">

            <h5><i class="fas fa-award"></i> Sertifikalar</h5>

            <ul>

                ${certificationList}

            </ul>

        </div>

        <div class="session-options">

            ${sessionOptions}

        </div>

    `;



    return div;

}



// Session selection

function selectSession(therapistId, sessionIndex) {

    // Clear previous selection

    document.querySelectorAll('.session-option').forEach(opt => {

        opt.classList.remove('selected');

    });



    // Mark selected session

    const sessionElement = event.currentTarget;

    sessionElement.classList.add('selected');



    // Store selected therapist and session

    const therapistType = Object.keys(therapistData.terapistler).find(type => 

        therapistData.terapistler[type].some(t => t.id === therapistId)

    );

    

    selectedTherapist = therapistData.terapistler[therapistType].find(t => t.id === therapistId);

    selectedSession = selectedTherapist.seanslar[sessionIndex];



    // Update appointment form

    updateAppointmentForm();

}



// Update appointment form

function updateAppointmentForm() {

    const form = document.getElementById('appointmentForm');

    if (form && selectedTherapist && selectedSession) {

        const hiddenTherapistData = document.getElementById('therapistData') || document.createElement('input');

        hiddenTherapistData.type = 'hidden';

        hiddenTherapistData.name = 'therapistData';

        hiddenTherapistData.id = 'therapistData';

        hiddenTherapistData.value = JSON.stringify(selectedTherapist);

        form.appendChild(hiddenTherapistData);



        const hiddenSessionData = document.getElementById('sessionData') || document.createElement('input');

        hiddenSessionData.type = 'hidden';

        hiddenSessionData.name = 'sessionData';

        hiddenSessionData.id = 'sessionData';

        hiddenSessionData.value = JSON.stringify(selectedSession);

        form.appendChild(hiddenSessionData);



        // Close modal

        const modal = bootstrap.Modal.getInstance(document.getElementById('therapistModal'));

        if (modal) {

            modal.hide();

        }

    }

}



// Form input formatting function

function setupFormInputs() {

    // Kart numarası formatı

    const cardNumberInput = document.querySelector('input[name="cardNumber"]');

    if (cardNumberInput) {

        cardNumberInput.addEventListener('input', function(e) {

            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');

            let formattedValue = '';

            for(let i = 0; i < value.length; i++) {

                if(i > 0 && i % 4 === 0) {

                    formattedValue += ' ';

                }

                formattedValue += value[i];

            }

            e.target.value = formattedValue;

        });

    }



    // Son kullanma tarihi formatı

    const expiryDateInput = document.querySelector('input[name="expiryDate"]');

    if (expiryDateInput) {

        expiryDateInput.addEventListener('input', function(e) {

            let value = e.target.value.replace(/\D/g, '');

            if (value.length >= 2) {

                value = value.slice(0,2) + '/' + value.slice(2,4);

            }

            e.target.value = value;

        });

    }



    // CVV sadece sayı

    const cvvInput = document.querySelector('input[name="cvv"]');

    if (cvvInput) {

        cvvInput.addEventListener('input', function(e) {

            e.target.value = e.target.value.replace(/\D/g, '');

        });

    }



    // Bağış formunu gönderme

    const donationForm = document.getElementById('donationForm');

    if (donationForm) {

        donationForm.addEventListener('submit', function(e) {

            e.preventDefault();

            

            const formData = new FormData(this);

            formData.append('amount', selectedAmount);

            

            fetch('process_donation.php', {

                method: 'POST',

                body: formData

            })

            .then(response => response.json())

            .then(data => {

                if (data.success) {

                    alert('Bağışınız için teşekkür ederiz! Dekont e-posta adresinize gönderildi.');

                    const donationModal = bootstrap.Modal.getInstance(document.getElementById('donationModal'));

                    if (donationModal) {

                        donationModal.hide();

                    }

                    this.reset();

                    // Seçimleri sıfırla

                    selectedAmount = 0;

                    document.querySelectorAll('.donation-amount').forEach(btn => btn.classList.remove('active'));

                    const customAmount = document.getElementById('customAmount');

                    if (customAmount) {

                        customAmount.value = '';

                    }

                } else {

                    alert('Bir hata oluştu: ' + data.message);

                }

            })

            .catch(error => {

                console.error('Error:', error);

                alert('Bir hata oluştu, lütfen tekrar deneyin.');

            });

        });

    }

}



// News Related Functions

async function loadNewsData() {

    try {

        const response = await fetch('data.json');

        const data = await response.json();

        newsData = data.haberler;

        renderNews();

    } catch (error) {

        console.error('Haberler yüklenirken hata:', error);

    }

}



function renderNews() {

    const newsSlider = document.querySelector('.news-slider');

    if (!newsSlider || !newsData) return;



    newsSlider.innerHTML = newsData.map(news => `

        <div class="news-card" onclick="openNewsModal('${news.id}')">

            <img src="${news.resim}" alt="${news.baslik}" class="news-image">

            <div class="news-content">

                <span class="news-tag">${news.etiket}</span>

                <h3 class="news-title">${news.baslik}</h3>

                <p class="news-excerpt">${news.kisaOzet}</p>

                <div class="news-date">

                    <i class="far fa-calendar-alt"></i>

                    ${news.tarih}

                </div>

            </div>

        </div>

    `).join('');

}



function openNewsModal(newsId) {
    if (!newsData || !Array.isArray(newsData)) {
        console.error('News data is not loaded or invalid.');
        return;
    }

    const news = newsData.find(n => n.id === newsId);

    if (!news) {
        console.warn('News not found for ID:', newsId);
        return;
    }

    const modal = document.getElementById('newsModal');

    if (!modal) {
        console.error('News modal element not found.');
        return;
    }

    // Populate modal content
    modal.querySelector('#modalImage').src = news.resim;
    modal.querySelector('.news-modal-title').textContent = news.baslik;
    modal.querySelector('.news-modal-content').innerHTML = `
        <p>${news.icerik?.anaMetin || 'İçerik bulunamadı.'}</p>
        <ul>
            ${news.icerik?.hedefler?.map(hedef => `<li>${hedef}</li>`).join('') || ''}
        </ul>
        <div class="news-details">
            ${news.icerik?.detaylar?.map(detay => `
                <h4>${detay.baslik}</h4>
                <p>${detay.icerik}</p>
            `).join('') || ''}
        </div>
    `;

    // Show modal with animation
    modal.style.display = 'block';
    modal.classList.add('show-modal');

    // Close modal on outside click
    window.onclick = function(event) {
        if (event.target === modal) {
            closeNewsModal();
        }
    };
}

function closeNewsModal() {
    const modal = document.getElementById('newsModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show-modal');
    }
}

async function handleAdminLogin(event) {
    event.preventDefault();

    // Form içindeki inputları name attribute'una göre seç
    const usernameInput = document.querySelector('#adminLoginForm input[name="username"]');
    const passwordInput = document.querySelector('#adminLoginForm input[name="password"]');

    if (!usernameInput || !passwordInput) {
        console.error('Username or password input element not found.');
        alert('Bir hata oluştu. Lütfen sayfayı yenileyin.');
        return;
    }

    const username = usernameInput.value;
    const password = passwordInput.value;

    try {
        const response = await fetch('data.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.admin && 
            data.admin.username === username && 
            data.admin.password === password) {
            
            // Login başarılı
            window.location.href = 'admin.html';
        } else {
            console.warn('Invalid username or password.');
            alert('Kullanıcı adı veya şifre hatalı.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Giriş sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
}



document.addEventListener('DOMContentLoaded', function() {

    // Initialize therapist data

    loadTherapistData();



    // Smooth scrolling for navigation links

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener('click', function (e) {

            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({

                behavior: 'smooth'

            });

        });

    });



    // Handle appointment form submission

    const appointmentForm = document.getElementById('appointmentForm');

    if (appointmentForm) {

        appointmentForm.addEventListener('submit', function(e) {

            e.preventDefault();

            

            const formData = new FormData(this);

            

            fetch('process_appointment.php', {

                method: 'POST',

                body: formData

            })

            .then(response => response.json())

            .then (data => {

                alert(data.message);

                if (data.success) {

                    this.reset();

                }

            })

            .catch(error => {

                console.error('Error:', error);

                alert('Bir hata oluştu, lütfen tekrar deneyin.');

            });

        });

    }



    // Handle contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Form verilerini al
            const name = this.querySelector('input[name="name"]').value;
            const email = this.querySelector('input[name="email"]').value;
            const message = this.querySelector('textarea[name="message"]').value;
            
            // Kullanıcıya işlem bilgisi ver
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
            submitBtn.disabled = true;
            
            // E-posta servisini kullanarak gönderme işlemi
            emailjs.send('default_service', 'template_contact', {
                to_email: 'iletisim@psykolink.com',
                from_name: name,
                from_email: email,
                message: message,
                reply_to: email
            })
            .then(function(response) {
                console.log('E-posta başarıyla gönderildi:', response);
                alert('Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.');
                contactForm.reset();
                
                // Butonu orijinal haline getir
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            })            .catch(function(error) {
                console.error('E-posta gönderilirken hata oluştu:', error);
                
                // E-posta gönderimi başarısız olduğunda alternatif olarak mailto: kullan
                const mailtoURL = `mailto:iletisim@psykolink.com?subject=İletişim Formu: ${name}&body=${message}%0A%0AGönderen: ${name}%0AE-posta: ${email}`;
                
                if (confirm('E-posta gönderimi sırasında bir sorun oluştu. E-posta uygulamanızı kullanarak mesaj göndermek ister misiniz?')) {
                    window.location.href = mailtoURL;
                }
                
                // Butonu orijinal haline getir
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    // Navbar background change on scroll

    window.addEventListener('scroll', function() {

        const navbar = document.querySelector('.navbar');

        if (window.scrollY > 50) {

            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';

            navbar.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';

        } else {

            navbar.style.backgroundColor = 'transparent';

            navbar.style.boxShadow = 'none';

        }

    });



    // Bağış işlemleri

    const donationAmounts = document.querySelectorAll('.donation-amount');

    const customAmount = document.getElementById('customAmount');

    const donateButton = document.getElementById('donateButton');

    const donationModal = document.getElementById('donationModal') ? 

        new bootstrap.Modal(document.getElementById('donationModal')) : null;

    let selectedAmount = 0;



    // Miktar butonlarına tıklama

    donationAmounts.forEach(btn => {

        btn.addEventListener('click', function() {

            donationAmounts.forEach(b => b.classList.remove('active'));

            this.classList.add('active');

            customAmount.value = '';

            selectedAmount = parseInt(this.dataset.amount);

            document.getElementById('selectedAmount').textContent = selectedAmount;

        });

    });



    // Özel miktar inputu değişikliği

    if (customAmount) {

        customAmount.addEventListener('input', function() {

            donationAmounts.forEach(btn => btn.classList.remove('active'));

            selectedAmount = parseInt(this.value) || 0;

            document.getElementById('selectedAmount').textContent = selectedAmount;

        });

    }



    // Bağış yap butonuna tıklama

    if (donateButton) {

        donateButton.addEventListener('click', function() {

            if (selectedAmount <= 0) {

                alert('Lütfen bir bağış miktarı seçin veya girin.');

                return;

            }

            document.getElementById('selectedAmount').textContent = selectedAmount;

            donationModal.show();

        });

    }



    // Form input formatting

    setupFormInputs();



    // Handle hamburger menu toggle

    const navbarToggler = document.querySelector('.navbar-toggler');

    const navbarCollapse = document.querySelector('.navbar-collapse');



    if (navbarToggler && navbarCollapse) {

        navbarToggler.addEventListener('click', function() {

            const isExpanded = this.getAttribute('aria-expanded') === 'true';

            

            // Toggle aria-expanded attribute

            this.setAttribute('aria-expanded', !isExpanded);

            

            // Toggle show class on navbar-collapse

            navbarCollapse.classList.toggle('show');

        });



        // Close menu when clicking outside

        document.addEventListener('click', function(event) {

            if (!navbarCollapse.contains(event.target) && !navbarToggler.contains(event.target)) {

                navbarCollapse.classList.remove('show');

                navbarToggler.setAttribute('aria-expanded', 'false');

            }

        });



        // Close menu when clicking on a nav link

        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {

            link.addEventListener('click', function() {

                navbarCollapse.classList.remove('show');

                navbarToggler.setAttribute('aria-expanded', 'false');

            });

        });

    }



    // Handle navbar background on scroll

    const navbar = document.querySelector('.navbar');

    if (navbar) {

        window.addEventListener('scroll', function() {

            if (window.scrollY > 50) {

                navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';

                navbar.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';

            } else {

                navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';

                navbar.style.boxShadow = 'none';

            }

        });

    }



    // Load initial news data

    loadNewsData();



    // Close modal when clicking outside

    document.addEventListener('click', function(event) {

        const modal = document.getElementById('newsModal');

        if (event.target === modal) {

            closeNewsModal();

        }

    });



    // Close modal with Escape key

    document.addEventListener('keydown', function(event) {

        if (event.key === 'Escape') {

            closeNewsModal();

        }

    });



    const newsSlider = document.querySelector('.news-slider');

    const prevButton = document.querySelector('.news-prev');

    const nextButton = document.querySelector('.news-next');

    

    if (prevButton && nextButton && newsSlider) {

        prevButton.addEventListener('click', () => {

            newsSlider.scrollBy({

                left: -420,

                behavior: 'smooth'

            });

        });



        nextButton.addEventListener('click', () => {

            newsSlider.scrollBy({

                left: 420,

                behavior: 'smooth'

            });

        });

    }

});



// Admin login işlevleri

let adminLoginModal = null;



function showAdminLogin() {
    // Get the modal element
    const modalElement = document.getElementById('adminLoginModal');
    
    if (!adminLoginModal) {
        // Initialize the modal with 'false' backdrop option to prevent the overlay completely
        adminLoginModal = new bootstrap.Modal(modalElement, {
            backdrop: false,
            keyboard: true
        });
    }
    
    // Show the modal
    adminLoginModal.show();
    
    // Remove any existing backdrop that might have been created
    setTimeout(() => {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
            backdrop.parentNode.removeChild(backdrop);
        });
        
        // Add proper styles to ensure the modal is visible and interactive
        modalElement.style.display = 'block';
        modalElement.style.zIndex = '1050';
        
        const modalDialog = modalElement.querySelector('.modal-dialog');
        if (modalDialog) {
            modalDialog.style.position = 'relative';
            modalDialog.style.zIndex = '1051';
            modalDialog.style.margin = '1.75rem auto';
        }
    }, 50);
}



async function handleAdminLogin(event) {

    event.preventDefault();

    // Use proper selectors with name attributes for the form inputs
    const usernameInput = document.querySelector('input[name="username"]');
    const passwordInput = document.querySelector('input[name="password"]');

    if (!usernameInput || !passwordInput) {

        console.error('Username or password input element not found.');

        alert('Bir hata oluştu. Lütfen sayfayı yenileyin.');

        return;

    }

    const username = usernameInput.value;

    const password = passwordInput.value;

    try {

        const response = await fetch('data.json');

        if (!response.ok) {

            throw new Error(`HTTP error! status: ${response.status}`);

        }

        const data = await response.json();

        if (data.admin && 

            data.admin.username === username && 

            data.admin.password === password) {

            

            // Login başarılı

            window.location.href = 'admin.html';

        } else {

            console.warn('Invalid username or password.');

            alert('Kullanıcı adı veya şifre hatalı.');

        }

    } catch (error) {

        console.error('Login error:', error);

        alert('Giriş sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');

    }

}