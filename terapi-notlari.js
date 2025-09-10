document.addEventListener('DOMContentLoaded', function() {
    // Terapi notlarını yükle
    loadTerapiNotes();
    
    // İlerleme durumunu hesapla
    calculateProgress();
});



function loadTerapiNotes() {

    const accordion = document.getElementById('notesAccordion');

    if (!accordion) {

        console.error('notesAccordion elementi bulunamadı');

        return;

    }



    fetch('data.json')

        .then(response => {

            if (!response.ok) {

                throw new Error(`HTTP error! status: ${response.status}`);

            }

            return response.json();

        })

        .then(data => {

            if (!data || !data.terapiNotlari) {

                throw new Error('Geçerli veri formatı bulunamadı');

            }



            const terapiNotlari = data.terapiNotlari;

            let accordionHtml = '';



            Object.keys(terapiNotlari).forEach((key, index) => {

                const category = terapiNotlari[key];

                if (category && category.baslik && category.icon) {

                    accordionHtml += createAccordionItem(category, key, index);

                }

            });



            if (accordionHtml) {

                accordion.innerHTML = accordionHtml;

            } else {

                accordion.innerHTML = `

                    <div class="alert alert-warning">

                        Henüz terapi notu bulunmamaktadır.

                    </div>

                `;

            }

            

            const loadingPlaceholder = document.querySelector('.loading-placeholder');            if (loadingPlaceholder) {
                loadingPlaceholder.remove();
            }
            
            // Refresh AOS to detect new elements
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        })
        .catch(error => {

            console.error('Terapi notları yüklenirken hata:', error);

            if (accordion) {

                accordion.innerHTML = `

                    <div class="alert alert-danger">

                        Terapi notları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.

                        <br><small class="text-muted">${error.message}</small>

                    </div>

                `;

            }

        });

}



function createAccordionItem(category, key, index) {
    const subCategories = category.altKategoriler || [];
    const delay = index * 50; // Add staggered delay based on index
    
    return `
        <div class="accordion-item" data-aos="fade-up" data-aos-delay="${delay}">
            <h2 class="accordion-header" id="heading${index}">
                <button class="accordion-button ${index !== 0 ? 'collapsed' : ''}" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#collapse${index}" 
                        aria-expanded="${index === 0 ? 'true' : 'false'}" 
                        aria-controls="collapse${index}">
                    <i class="${category.icon} category-icon me-2"></i>
                    ${category.baslik}
                </button>
            </h2>
            <div id="collapse${index}" 
                 class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" 
                 aria-labelledby="heading${index}" 
                 data-bs-parent="#notesAccordion">
                <div class="accordion-body">
                    <p class="category-description mb-4">${category.aciklama}</p>
                    <ul class="subcategory-list">
                        ${subCategories.map((sub, subIndex) => createSubcategoryItem(sub, subIndex)).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;

}



function createSubcategoryItem(subcategory, subIndex) {
    const delay = subIndex * 50; // Staggered delay for subcategories
    
    return `
        <li class="subcategory-item" data-id="${subcategory.id}" data-aos="fade-up" data-aos-delay="${delay}">
            <h3>
                <i class="${subcategory.icon}"></i>
                ${subcategory.baslik}
            </h3>
            <p>${subcategory.aciklama}</p>
            <div class="d-flex justify-content-between align-items-center mt-3">

                <span class="status-badge">${subcategory.durum}</span>

                <button class="btn btn-outline-primary btn-sm" 

                        onclick="openSubcategory('${subcategory.id}')"

                        ${subcategory.durum === 'Yapım Aşamasında' ? 'disabled' : ''}>

                    Başla

                </button>

            </div>

        </li>

    `;

}



function openSubcategory(id) {

    console.log('Opening subcategory:', id);
    
    // Modal nesnesini oluştur
    const subcategoryModal = new bootstrap.Modal(document.getElementById('subcategoryModal'));
    
    // İçerik konteynerini seç
    const contentContainer = document.getElementById('subcategoryContent');
    
    // Modal başlığını seç
    const modalTitle = document.getElementById('subcategoryModalLabel');
    
    // Yükleniyor durumunu göster
    contentContainer.innerHTML = `
        <div class="text-center my-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Yükleniyor...</span>
            </div>
            <p class="mt-3">İçerik yükleniyor, lütfen bekleyiniz...</p>
        </div>
    `;
    
    // Modalı göster
    subcategoryModal.show();
    
    // data.json'dan ilgili alt kategori verilerini çek
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            // Alt kategoriyi bul
            let foundSubcategory = null;
            let categoryKey = '';
            
            // Tüm kategorileri dolaş
            Object.keys(data.terapiNotlari).forEach(key => {
                const category = data.terapiNotlari[key];
                
                // Alt kategorileri kontrol et
                if (category.altKategoriler) {
                    const found = category.altKategoriler.find(sub => sub.id === id);
                    if (found) {
                        foundSubcategory = found;
                        categoryKey = key;
                    }
                }
            });
            
            if (foundSubcategory) {
                // Modal başlığını güncelle
                modalTitle.textContent = foundSubcategory.baslik;
                
                // İçeriği göster (data.json'da içerik varsa)
                if (foundSubcategory.icerik) {                    contentContainer.innerHTML = `
                        <div class="subcategory-content">
                            <h3 class="mb-4" data-aos="fade-up"><i class="${foundSubcategory.icon}"></i> ${foundSubcategory.baslik}</h3>
                            <div class="subcategory-description mb-4" data-aos="fade-up" data-aos-delay="100">
                                ${foundSubcategory.icerik.aciklama || foundSubcategory.aciklama}
                            </div>
                            
                            ${foundSubcategory.icerik.bolumler ? 
                                `<div class="subcategory-sections">
                                    ${foundSubcategory.icerik.bolumler.map((bolum, bolumIndex) => `
                                        <div class="section-item mb-4" data-aos="fade-up" data-aos-delay="${150 + (bolumIndex * 50)}">
                                            <h4>${bolum.baslik}</h4>
                                            <div class="section-content">
                                                ${bolum.icerik}
                                            </div>
                                            ${bolum.ornekler ? 
                                                `<div class="examples mt-3" data-aos="fade-up" data-aos-delay="${200 + (bolumIndex * 50)}">
                                                    <h5>Örnekler:</h5>
                                                    <ul class="example-list">
                                                        ${bolum.ornekler.map(ornek => `<li>${ornek}</li>`).join('')}
                                                    </ul>
                                                </div>` : ''
                                            }
                                        </div>
                                    `).join('')}
                                </div>` : ''
                            }
                            
                            ${foundSubcategory.icerik.alistirmalar ? 
                                `<div class="exercises mt-4">
                                    <h4 class="mb-3" data-aos="fade-up" data-aos-delay="250">Alıştırmalar</h4>
                                    <div class="exercise-list">
                                        ${foundSubcategory.icerik.alistirmalar.map((alistirma, index) => `
                                            <div class="exercise-item mb-3 p-3 border rounded" data-aos="fade-up" data-aos-delay="${300 + (index * 50)}">
                                                <h5>Alıştırma ${index + 1}: ${alistirma.baslik}</h5>
                                                <p>${alistirma.aciklama}</p>
                                                ${alistirma.adimlar ? 
                                                    `<ol class="exercise-steps">
                                                        ${alistirma.adimlar.map(adim => `<li>${adim}</li>`).join('')}
                                                    </ol>` : ''
                                                }
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>` : ''
                            }                        </div>
                    `;
                    
                    // Refresh AOS animations after content is loaded
                    setTimeout(() => {
                        if (typeof AOS !== 'undefined') {
                            AOS.refresh();
                        }
                    }, 100);
                } else {
                    // İçerik henüz eklenmemişse
                    contentContainer.innerHTML = `
                        <div class="alert alert-info" data-aos="fade-up">
                            <h4 class="alert-heading">Yapım Aşamasında</h4>
                            <p>Bu içerik henüz yapım aşamasındadır. Lütfen daha sonra tekrar deneyiniz.</p>
                        </div>
                    `;
                }
                
                // Tamamlandı olarak işaretle butonunu yapılandır
                const markAsCompleteBtn = document.getElementById('markAsComplete');
                if (markAsCompleteBtn) {
                    if (foundSubcategory.durum === 'Tamamlandı') {
                        markAsCompleteBtn.textContent = 'Tamamlandı';
                        markAsCompleteBtn.disabled = true;
                        markAsCompleteBtn.classList.remove('btn-primary');
                        markAsCompleteBtn.classList.add('btn-success');
                    } else if (foundSubcategory.durum === 'Yapım Aşamasında') {
                        markAsCompleteBtn.disabled = true;
                        markAsCompleteBtn.textContent = 'Yapım Aşamasında';
                    } else {
                        markAsCompleteBtn.textContent = 'Tamamlandı Olarak İşaretle';
                        markAsCompleteBtn.disabled = false;
                        markAsCompleteBtn.classList.add('btn-primary');
                        markAsCompleteBtn.classList.remove('btn-success');
                        
                        // Tamamlandı olarak işaretleme işlevselliği
                        markAsCompleteBtn.onclick = function() {
                            markSubcategoryAsComplete(categoryKey, id);
                        };
                    }
                }
            } else {
                // Alt kategori bulunamadıysa
                contentContainer.innerHTML = `
                    <div class="alert alert-danger">
                        <h4 class="alert-heading">Hata!</h4>
                        <p>İçerik bulunamadı. Lütfen daha sonra tekrar deneyiniz.</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Alt kategori içeriği yüklenirken hata:', error);
            contentContainer.innerHTML = `
                <div class="alert alert-danger">
                    <h4 class="alert-heading">Hata!</h4>
                    <p>İçerik yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.</p>
                    <p class="mb-0"><small>${error.message}</small></p>
                </div>
            `;
        });
}

// Alt kategoriyi tamamlandı olarak işaretle
function markSubcategoryAsComplete(categoryKey, subcategoryId) {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            // İlgili alt kategoriyi bul ve güncelle
            const category = data.terapiNotlari[categoryKey];
            if (category && category.altKategoriler) {
                const subcategory = category.altKategoriler.find(sub => sub.id === subcategoryId);
                if (subcategory) {
                    subcategory.durum = 'Tamamlandı';
                    
                    // Veriyi sunucuya gönder
                    return fetch('save-data.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });
                }
            }
            throw new Error('Alt kategori bulunamadı');
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // Başarılı mesajı göster
                alert('Tebrikler! Bu bölümü tamamladınız.');
                
                // Butonu güncelle
                const markAsCompleteBtn = document.getElementById('markAsComplete');
                if (markAsCompleteBtn) {
                    markAsCompleteBtn.textContent = 'Tamamlandı';
                    markAsCompleteBtn.disabled = true;
                    markAsCompleteBtn.classList.remove('btn-primary');
                    markAsCompleteBtn.classList.add('btn-success');
                }
                
                // İlerleme durumunu güncelle
                calculateProgress();
                
                // Sayfayı yenile
                loadTerapiNotes();
            } else {
                throw new Error(result.message || 'Kaydetme işlemi başarısız oldu');
            }
        })
        .catch(error => {
            console.error('Tamamlama işlemi sırasında hata:', error);
            alert('Bir hata oluştu: ' + error.message);
        });
}



function calculateProgress() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const terapiNotlari = data.terapiNotlari;
            
            // Ana kategori ve alt kategori sayılarını hesapla
            let totalCategories = Object.keys(terapiNotlari).length;
            let totalSubcategories = 0;
            let totalItems = 0; // Toplam öğe sayısı (ana + alt)
            
            // Tamamlanmış öğeleri sayma
            let completedSubcategories = 0;
            let completedCategories = 0;
            
            // Ana kategorileri ve alt kategorileri say
            Object.values(terapiNotlari).forEach(category => {
                if (category.altKategoriler) {
                    const subCategories = category.altKategoriler;
                    const subCategoryCount = subCategories.length;
                    totalSubcategories += subCategoryCount;
                    
                    // Bu kategoride tamamlanmış alt kategorileri say
                    const completedInThisCategory = subCategories.filter(sub => 
                        sub.durum === "Tamamlandı"
                    ).length;
                    
                    completedSubcategories += completedInThisCategory;
                    
                    // Eğer kategorideki tüm alt kategoriler tamamlandıysa, ana kategori de tamamlanmış sayılır
                    if (subCategoryCount > 0 && completedInThisCategory === subCategoryCount) {
                        completedCategories++;
                    }
                }
            });
            
            totalItems = totalCategories + totalSubcategories;
            const completedItems = completedCategories + completedSubcategories;
            
            // İlerleme yüzdesini hesapla
            const progressPercentage = totalItems > 0 
                ? Math.round((completedItems / totalItems) * 100)
                : 0;
            
            // İlerleme çubuğunu güncelle
            const progressBar = document.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = `${progressPercentage}%`;
                progressBar.setAttribute('aria-valuenow', progressPercentage);
                progressBar.textContent = `${progressPercentage}%`;
            }
            
            // İlerleme durumu metnini güncelle
            const progressText = document.getElementById('progressText');
            if (progressText) {
                progressText.textContent = `${completedItems} / ${totalItems} tamamlandı`;
            }
            
            // Sertifika durumunu kontrol et
            const certificateStatus = document.getElementById('certificateStatus');
            if (certificateStatus) {
                if (progressPercentage === 100) {
                    certificateStatus.innerHTML = `
                        <div class="alert alert-success">
                            <i class="fas fa-certificate me-2"></i>
                            Tüm içerikleri tamamladınız! 
                            <a href="#" class="btn btn-sm btn-success ms-3" onclick="downloadCertificate()">Sertifikanızı İndirin</a>
                        </div>
                    `;
                } else {
                    certificateStatus.innerHTML = `
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            Sertifikanızı almak için tüm içerikleri tamamlamanız gerekmektedir.
                        </div>
                    `;
                }
            }
        })
        .catch(error => {
            console.error('Error calculating progress:', error);
        });
}



document.addEventListener('mouseover', function(event) {

    const subcategoryItem = event.target.closest('.subcategory-item');

    if (subcategoryItem) {

        subcategoryItem.style.transform = 'translateY(-2px)';

        subcategoryItem.style.transition = 'transform 0.2s ease-in-out';

    }

});



document.addEventListener('mouseout', function(event) {

    const subcategoryItem = event.target.closest('.subcategory-item');

    if (subcategoryItem) {

        subcategoryItem.style.transform = 'translateY(0)';

    }

});

// Sertifika indirme fonksiyonu
function downloadCertificate() {
    // Kullanıcı adını al (gerçek uygulamada kullanıcı oturum bilgilerinden alınabilir)
    const userName = prompt("Lütfen sertifika üzerinde görünecek adınızı ve soyadınızı girin:", "");
    
    if (!userName || userName.trim() === "") {
        alert("Sertifika oluşturmak için isim gereklidir.");
        return;
    }
    
    // Sertifika oluşturma tarihini al
    const today = new Date();
    const dateString = today.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    // Sertifika URL'ini oluştur (gerçek uygulamada bir API'ye istek gönderilebilir)
    // Burada sadece basit bir simülasyon yapıyoruz
    setTimeout(() => {
        alert(`Sayın ${userName}, bilişsel terapi notları eğitimini başarıyla tamamladığınız için tebrikler! Sertifikanız ${dateString} tarihinde oluşturulmuştur.`);
        
        // Gerçek uygulamada burada bir PDF sertifika oluşturup indirilebilir
        // Örneğin, jsPDF kütüphanesi kullanılabilir veya backend'den sertifika talep edilebilir
        console.log("Sertifika indirme isteği gönderildi:", {
            name: userName,
            date: dateString,
            course: "Bilişsel Terapi Teknikleri"
        });
    }, 1500);
}
