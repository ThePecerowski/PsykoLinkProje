// Site verilerini tutacak değişken

let siteData = null;



// DOM yüklendiğinde

document.addEventListener('DOMContentLoaded', function() {

    // Sayfa yüklendiğinde verileri yükle

    loadSiteData();



    // Navigation event listeners

    document.querySelectorAll('.admin-nav-item').forEach(item => {

        item.addEventListener('click', function() {

            document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));

            document.querySelectorAll('.content-editor').forEach(editor => editor.classList.remove('active'));

            

            this.classList.add('active');

            const section = this.dataset.section;

            document.getElementById(section).classList.add('active');

        });

    });



    // Form event listeners

    document.getElementById('newsForm')?.addEventListener('submit', handleNewsSubmit);

    document.getElementById('categoryForm')?.addEventListener('submit', handleCategorySubmit);

    document.getElementById('subcategoryForm')?.addEventListener('submit', handleSubcategorySubmit);
    document.getElementById('adminForm')?.addEventListener('submit', handleAdminSubmit);

    

    // Preview button event listener

    document.getElementById('previewSubcategory')?.addEventListener('click', handlePreview);

    // Yeni kategori butonu

    document.getElementById('newCategoryBtn')?.addEventListener('click', () => {
        const formCard = document.getElementById('categoryFormCard');
        formCard.style.display = 'block';
        formCard.classList.add('show');
        document.getElementById('subcategoryFormCard').style.display = 'none';
        document.getElementById('welcomeCard').style.display = 'none';
        document.getElementById('categoryForm').reset();
        const form = document.getElementById('categoryForm');
        form.categoryId.disabled = false;
        delete form.dataset.editing;
        document.getElementById('categoryFormTitle').textContent = 'Yeni Kategori';
    });


    // Yeni alt kategori butonu

    document.getElementById('newSubcategoryBtn')?.addEventListener('click', () => {
        const formCard = document.getElementById('subcategoryFormCard');
        formCard.style.display = 'block';
        formCard.classList.add('show');
        document.getElementById('categoryFormCard').style.display = 'none';
        document.getElementById('welcomeCard').style.display = 'none';
        document.getElementById('subcategoryForm').reset();
        const form = document.getElementById('subcategoryForm');
        delete form.dataset.editing;
        delete form.dataset.originalParent;
        delete form.dataset.originalId;
        document.getElementById('subcategoryFormTitle').textContent = 'Yeni Alt Kategori';
    });
    // Form kapatma butonları

    document.getElementById('closeCategoryForm')?.addEventListener('click', () => {
        const formCard = document.getElementById('categoryFormCard');
        formCard.classList.remove('show');
        setTimeout(() => {
            formCard.style.display = 'none';
            document.getElementById('welcomeCard').style.display = 'block';
        }, 300);
        const form = document.getElementById('categoryForm');
        form.categoryId.disabled = false;
        delete form.dataset.editing;
    });


    document.getElementById('closeSubcategoryForm')?.addEventListener('click', () => {
        const formCard = document.getElementById('subcategoryFormCard');
        formCard.classList.remove('show');
        setTimeout(() => {
            formCard.style.display = 'none';
            document.getElementById('welcomeCard').style.display = 'block';
        }, 300);
        const form = document.getElementById('subcategoryForm');
        delete form.dataset.editing;
        delete form.dataset.originalParent;
        delete form.dataset.originalId;
    });


    // Kategori ağacı kontrolleri

    document.getElementById('collapseAllBtn')?.addEventListener('click', collapseAllCategories);

    document.getElementById('expandAllBtn')?.addEventListener('click', expandAllCategories);

    

    // Kategori hover efektleri

    document.addEventListener('mouseover', handleCategoryHover);
    document.addEventListener('mouseout', handleCategoryHover);

    // JSON kaydet butonu
    document.getElementById('saveJson')?.addEventListener('click', saveData);

    // Input validation listeners
    setupFormValidation();
});


// Kategori ID validation

document.querySelector('input[name="categoryId"]')?.addEventListener('input', function(e) {

    const value = e.target.value;

    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    if (value !== sanitized) {

        e.target.value = sanitized;

    }

});



// Alt kategori ID validation

document.querySelector('input[name="subcategoryId"]')?.addEventListener('input', function(e) {

    const value = e.target.value;

    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    if (value !== sanitized) {

        e.target.value = sanitized;

    }

});



// Verileri yükle

async function loadSiteData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        siteData = await response.json();
        updateUI();
    } catch (error) {
        console.error('Veri yükleme hatası:', error);
        showError('Veriler yüklenirken bir hata oluştu');
    }
}


// UI'ı güncelle

function updateUI() {

    updateNewsList();

    updateCategoryList();

    updateCategorySelect();
    
    // Admin bilgilerini güncelle
    updateAdminForm();

}



// Haber listesini güncelle

function updateNewsList() {
    const newsList = document.getElementById('newsList');

    if (!newsList || !siteData.haberler) return;



    newsList.innerHTML = '';

    siteData.haberler.forEach(news => {

        const div = document.createElement('div');

        div.className = 'list-group-item d-flex justify-content-between align-items-center';

        div.innerHTML = `

            <div>

                <h6 class="mb-1">${news.baslik}</h6>

                <small class="text-muted">${news.tarih}</small>

            </div>

            <div>

                <button class="btn btn-sm btn-outline-primary me-2" onclick="editNews('${news.id}')">

                    <i class="fas fa-edit"></i>

                </button>

                <button class="btn btn-sm btn-outline-danger" onclick="deleteNews('${news.id}')">

                    <i class="fas fa-trash"></i>

                </button>

            </div>

        `;

        newsList.appendChild(div);

    });

}



// Kategori listesini güncelle

function updateCategoryList() {

    const categoriesList = document.getElementById('categoriesList');

    if (!categoriesList || !siteData?.terapiNotlari) return;



    categoriesList.innerHTML = '';

        for (const [id, category] of Object.entries(siteData.terapiNotlari)) {

        const categoryDiv = document.createElement('div');

        categoryDiv.className = 'category-item';

        categoryDiv.innerHTML = `

            <div class="d-flex align-items-center justify-content-between">

                <div class="category-header" onclick="toggleCategory('${id}')">

                    <i class="${category.icon} me-2"></i>

                    <span>${category.baslik}</span>

                </div>

                <div class="category-actions">

                    <button class="btn btn-sm btn-link text-primary" onclick="editCategory('${id}')" data-tooltip="Kategoriyi Düzenle">

                        <i class="fas fa-edit"></i>

                    </button>

                    <button class="btn btn-sm btn-link text-danger" onclick="deleteCategory('${id}')" data-tooltip="Kategoriyi Sil">

                        <i class="fas fa-trash"></i>

                    </button>

                </div>

            </div>

            <div class="category-content" id="category-${id}">

                <div class="subcategory-list">

                    ${category.altKategoriler.map(sub => `

                        <div class="subcategory-item">

                            <div class="d-flex align-items-center justify-content-between">

                                <div class="subcategory-header">

                                    <i class="${sub.icon || 'fas fa-file-alt'} me-2"></i>

                                    <span>${sub.baslik}</span>

                                </div>

                                <div class="subcategory-actions">

                                    <button class="btn btn-sm btn-link text-info" onclick="previewSubcategoryContent('${id}', '${sub.id}')" data-tooltip="İçeriği Önizle">

                                        <i class="fas fa-eye"></i>

                                    </button>

                                    <button class="btn btn-sm btn-link text-primary" onclick="editSubcategory('${id}', '${sub.id}')" data-tooltip="Alt Kategoriyi Düzenle">

                                        <i class="fas fa-edit"></i>

                                    </button>

                                    <button class="btn btn-sm btn-link text-danger" onclick="deleteSubcategory('${id}', '${sub.id}')" data-tooltip="Alt Kategoriyi Sil">

                                        <i class="fas fa-trash"></i>

                                    </button>

                                </div>

                            </div>

                            <small class="text-muted d-block mt-1">${sub.aciklama}</small>

                            <div class="d-flex justify-content-between align-items-center mt-2">

                                <span class="badge badge-${getStatusBadgeClass(sub.durum)}">${sub.durum}</span>

                                <small class="text-muted">${formatDate(sub.guncellenmeTarihi || new Date())}</small>

                            </div>

                            ${sub.durum === 'Tamamlandı' ? 

                                `<div class="progress-status mt-2">

                                    <div class="progress-bar-custom" style="width: 100%"></div>

                                </div>` : 

                                sub.durum === 'Yapım Aşamasında' ? 

                                `<div class="progress-status mt-2">

                                    <div class="progress-bar-custom" style="width: 30%"></div>

                                </div>` : 

                                `<div class="progress-status mt-2">

                                    <div class="progress-bar-custom" style="width: 70%"></div>

                                </div>`

                            }

                        </div>

                    `).join('')}

                </div>

            </div>

        `;

        categoriesList.appendChild(categoryDiv);

    }

}



// Yardımcı fonksiyonlar

function toggleCategory(id) {
    const content = document.getElementById(`category-${id}`);
    const header = document.querySelector(`[onclick="toggleCategory('${id}')"]`);
    const icon = header.querySelector('i');
    
    if (content) {
        // Toggle the open class
        content.classList.toggle('open');
        
        // Animate the icon rotation
        if (content.classList.contains('open')) {
            icon.style.transform = 'rotate(90deg)';
        } else {
            icon.style.transform = 'rotate(0deg)';
        }
    }
}



function getStatusBadgeColor(status) {

    switch (status) {

        case 'Hazır': return 'success';

        case 'Yapım Aşamasında': return 'warning';

        case 'Güncelleniyor': return 'info';

        default: return 'secondary';

    }

}

function getStatusBadgeClass(status) {
    switch(status) {
        case 'Hazır':
            return 'success';
        case 'Yapım Aşamasında':
            return 'warning';
        case 'Güncelleniyor':
            return 'info';
        case 'Tamamlandı':
            return 'primary';
        default:
            return 'secondary';
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function previewSubcategoryContent(categoryId, subcategoryId) {
    const modal = new bootstrap.Modal(document.getElementById('previewModal'));
    const previewContent = document.getElementById('previewContent');
    
    if (siteData && siteData.terapiNotlari && siteData.terapiNotlari[categoryId]) {
        const category = siteData.terapiNotlari[categoryId];
        const subcategory = category.altKategoriler.find(sub => sub.id === subcategoryId);
        
        if (subcategory) {
            // Set the modal title
            document.querySelector('#previewModal .modal-title').textContent = 
                `${category.baslik} - ${subcategory.baslik}`;
            
            // Show loading state
            previewContent.innerHTML = `
                <div class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Yükleniyor...</span>
                    </div>
                    <p class="mt-3">İçerik yükleniyor...</p>
                </div>
            `;
            
            // Show the modal
            modal.show();
            
            // Simulate loading delay for better UX
            setTimeout(() => {
                previewContent.innerHTML = subcategory.icerik ? 
                    `<div class="content-preview">${subcategory.icerik}</div>` : 
                    `<div class="alert alert-info">Bu alt kategori için henüz içerik eklenmemiş.</div>`;
            }, 500);
        }
    }
}



function resetCategoryForm() {

    document.getElementById('categoryForm').reset();

}



function resetSubcategoryForm() {
    document.getElementById('subcategoryForm').reset();
}

// Haberi sil
function deleteNews(id) {
    if (!siteData?.haberler) return;
    if (!confirm('Haberi silmek istediğinize emin misiniz?')) return;
    siteData.haberler = siteData.haberler.filter(n => n.id !== id);
    saveData().then(saved => {
        if (saved) {
            updateNewsList();
            showSuccess('Haber silindi');
        }
    });
}

// Haber formu gönderimi
async function handleNewsSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const newNews = {
        id: 'news-' + Date.now(),
        baslik: form.title.value,
        kategori: form.category.value,
        icerik: form.content.value,
        resim: form.image.value,
        tarih: new Date().toLocaleDateString('tr-TR')
    };

    siteData.haberler = siteData.haberler || [];
    siteData.haberler.unshift(newNews);
    const saved = await saveData();
    if (saved) {
        updateNewsList();
        form.reset();
        showSuccess('Haber kaydedildi');
    }
}

// Kategori formu gönderimi
async function handleCategorySubmit(event) {
    event.preventDefault();
    const form = event.target;
    const id = form.categoryId.value.trim();
    const editing = form.dataset.editing === 'true';

    if (!siteData.terapiNotlari) {
        siteData.terapiNotlari = {};
    }

    const existing = siteData.terapiNotlari[id];
    const category = {
        baslik: form.title.value,
        icon: form.icon.value,
        aciklama: form.description.value,
        altKategoriler: editing && existing ? existing.altKategoriler : existing ? existing.altKategoriler : []
    };

    siteData.terapiNotlari[id] = category;
    const saved = await saveData();
    if (saved) {
        updateCategoryList();
        updateCategorySelect();
        form.reset();
        form.categoryId.disabled = false;
        delete form.dataset.editing;
        showSuccess(editing ? 'Kategori güncellendi' : 'Kategori kaydedildi');
    }
}

// Alt kategori formu gönderimi
async function handleSubcategorySubmit(event) {
    event.preventDefault();
    const form = event.target;
    const parentId = form.parentCategory.value;
    const editing = form.dataset.editing === 'true';
    const originalId = form.dataset.originalId;
    const originalParent = form.dataset.originalParent;

    if (!siteData.terapiNotlari || !siteData.terapiNotlari[parentId]) {
        showError('Ana kategori bulunamadı');
        return;
    }

    const targetList = siteData.terapiNotlari[parentId].altKategoriler;

    if (editing) {
        if (originalParent && originalParent !== parentId && siteData.terapiNotlari[originalParent]) {
            const oldList = siteData.terapiNotlari[originalParent].altKategoriler;
            siteData.terapiNotlari[originalParent].altKategoriler = oldList.filter(s => s.id !== originalId);
        }
        const index = targetList.findIndex(s => s.id === originalId);
        if (index === -1) {
            showError('Alt kategori bulunamadı');
            return;
        }
        targetList[index] = {
            ...targetList[index],
            baslik: form.subcategoryTitle.value,
            durum: form.subcategoryStatus.value,
            aciklama: form.subcategoryDescription.value,
            icerik: form.subcategoryContent.value
        };
    } else {
        const subcategory = {
            id: 'sub-' + Date.now(),
            baslik: form.subcategoryTitle.value,
            durum: form.subcategoryStatus.value,
            aciklama: form.subcategoryDescription.value,
            icon: 'fas fa-file-alt',
            icerik: form.subcategoryContent.value
        };
        targetList.push(subcategory);
    }

    const saved = await saveData();
    if (saved) {
        updateCategoryList();
        form.reset();
        delete form.dataset.editing;
        delete form.dataset.originalParent;
        delete form.dataset.originalId;
        showSuccess(editing ? 'Alt kategori güncellendi' : 'Alt kategori eklendi');
    }
}

// Admin bilgilerini güncelle
async function handleAdminSubmit(event) {
    event.preventDefault();
    
    const username = document.querySelector('input[name="username"]').value;
    const password = document.querySelector('input[name="password"]').value;
    
    if (!username) {
        showError('Kullanıcı adı boş olamaz');
        return;
    }
    
    // Şifre alanı boşsa şifreyi değiştirme
    if (siteData.admin && !password) {
        showSuccess('Admin kullanıcı adı güncellendi');
        siteData.admin.username = username;
    } else {
        // Yeni şifre veya ilk kez admin oluşturma
        if (!siteData.admin) {
            siteData.admin = {};
        }
        
        siteData.admin.username = username;
        siteData.admin.password = password;
        
        showSuccess('Admin bilgileri güncellendi');
        
        // Güncel şifreyi göster
        const passwordDisplay = document.getElementById('currentPassword');
        if (passwordDisplay) {
            passwordDisplay.textContent = password;
            passwordDisplay.parentElement.classList.remove('d-none');
        }
    }
    
    // JSON editör alanını güncelle
    document.getElementById('jsonEditor').value = JSON.stringify(siteData, null, 2);
    
    // Verileri kaydet
    await saveData();
}

// Admin formunu güncelle
function updateAdminForm() {
    // Admin kullanıcı adı güncelle
    const usernameInput = document.querySelector('input[name="username"]');
    const jsonEditor = document.getElementById('jsonEditor');
    
    if (usernameInput && siteData.admin) {
        usernameInput.value = siteData.admin.username || '';
    }
    
    // JSON editör alanını güncelle
    if (jsonEditor) {
        jsonEditor.value = JSON.stringify(siteData, null, 2);
    }
}

// Alt kategori formunda kategori seçeneklerini güncelle
function updateCategorySelect() {
    const select = document.querySelector('select[name="parentCategory"]');
    if (!select || !siteData?.terapiNotlari) return;

    select.innerHTML = '<option value="" disabled selected>Kategori Seçin</option>';
    Object.keys(siteData.terapiNotlari).forEach(id => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = siteData.terapiNotlari[id].baslik;
        select.appendChild(opt);
    });
}


// Form doğrulama

function setupFormValidation() {

    const forms = document.querySelectorAll('.needs-validation');

    forms.forEach(form => {

        form.addEventListener('submit', event => {

            if (!form.checkValidity()) {

                event.preventDefault();

                event.stopPropagation();

            }

            form.classList.add('was-validated');

        });

    });

}



// Verileri kaydet

async function saveData() {

    try {

        const response = await fetch('save-data.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(siteData)
        });



        if (!response.ok) {

            throw new Error('Kayıt başarısız');

        }



        return true;

    } catch (error) {

        console.error('Veri kaydetme hatası:', error);

        showError('Veriler kaydedilirken bir hata oluştu');

        return false;

    }

}



// İçerik önizleme

function handlePreview() {

    const content = document.querySelector('textarea[name="subcategoryContent"]').value;

    const title = document.querySelector('input[name="subcategoryTitle"]').value;

    

    const previewContent = document.getElementById('previewContent');

    previewContent.innerHTML = `

        <h3>${title || 'Başlıksız'}</h3>

        <div class="content-preview">

            ${content || 'İçerik girilmedi'}

        </div>

    `;

    

    const modal = new bootstrap.Modal(document.getElementById('previewModal'));

    modal.show();

}



// UI bildirim fonksiyonları

function showSuccess(message) {
    createToast('success', message, 'fas fa-check-circle');
}

function showError(message) {
    createToast('danger', message, 'fas fa-exclamation-circle');
}

function createToast(type, message, icon) {
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    toastContainer.style.zIndex = '1050';

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.style.borderRadius = '8px';

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body d-flex align-items-center">
                <i class="${icon} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    toastContainer.appendChild(toast);
    document.body.appendChild(toastContainer);

    const bsToast = new bootstrap.Toast(toast, {
        animation: true,
        autohide: true,
        delay: 3000
    });

    bsToast.show();

    toast.addEventListener('shown.bs.toast', () => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });

    toast.addEventListener('hidden.bs.toast', () => {
        document.body.removeChild(toastContainer);
    });
}



// Yükleniyor göstergesi

function showLoading() {

    document.getElementById('refreshOverlay').style.display = 'flex';

}



function hideLoading() {

    document.getElementById('refreshOverlay').style.display = 'none';

}



// Kategori ağacını güncelle

function updateCategoryTree() {

    const categoriesList = document.getElementById('categoriesList');

    if (!categoriesList || !siteData?.terapiNotlari) return;



    let html = '';

    Object.entries(siteData.terapiNotlari).forEach(([key, category]) => {

        html += `

            <div class="category-item mb-2 p-3">

                <div class="d-flex justify-content-between align-items-center">

                    <div>

                        <i class="${category.icon} me-2 text-primary"></i>

                        <span>${category.baslik}</span>

                    </div>

                    <div class="btn-group">

                        <button class="btn btn-sm btn-outline-primary" onclick="editCategory('${key}')">

                            <i class="fas fa-edit"></i>

                        </button>

                        <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory('${key}')">

                            <i class="fas fa-trash"></i>

                        </button>

                    </div>

                </div>

                ${renderSubcategories(category.altKategoriler)}

            </div>

        `;

    });

    

    categoriesList.innerHTML = html;

}



// Alt kategorileri render et

function renderSubcategories(subcategories) {

    if (!subcategories?.length) return '';

    

    let html = '<div class="ms-4 mt-2">';

    subcategories.forEach((sub, index) => {

        html += `

            <div class="subcategory-item mb-2 p-2 bg-light rounded">

                <div class="d-flex justify-content-between align-items-center">

                    <div>

                        <i class="fas fa-file-alt me-2 text-secondary"></i>

                        <span>${sub.baslik}</span>

                    </div>

                    <div class="btn-group">

                        <button class="btn btn-sm btn-outline-secondary" onclick="editSubcategory(${index})">

                            <i class="fas fa-edit"></i>

                        </button>

                        <button class="btn btn-sm btn-outline-danger" onclick="deleteSubcategory(${index})">

                            <i class="fas fa-trash"></i>

                        </button>

                    </div>

                </div>

            </div>

        `;

    });

    html += '</div>';

    return html;

}



// Tüm kategorileri daralt

function collapseAllCategories() {

    document.querySelectorAll('.subcategory-list').forEach(list => {

        list.style.display = 'none';

    });

}



// Tüm kategorileri genişlet

function expandAllCategories() {

    document.querySelectorAll('.subcategory-list').forEach(list => {

        list.style.display = 'block';

    });

}



// Kategori hover efektlerini yönet

function handleCategoryHover(event) {
    const categoryItem = event.target.closest('.category-item');
    if (!categoryItem) return;

    const actions = categoryItem.querySelector('.category-actions');
    if (!actions) return;
    
    if (event.type === 'mouseover') {
        actions.style.opacity = '1';
        categoryItem.style.transform = 'translateY(-2px)';
        categoryItem.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    } else {
        actions.style.opacity = '0.7';
        categoryItem.style.transform = '';
        categoryItem.style.boxShadow = '';
    }
}

// Kategori düzenle
function editCategory(id) {
    const category = siteData?.terapiNotlari?.[id];
    if (!category) return;

    const formCard = document.getElementById('categoryFormCard');
    formCard.style.display = 'block';
    setTimeout(() => formCard.classList.add('show'), 10);
    
    document.getElementById('subcategoryFormCard').style.display = 'none';
    document.getElementById('welcomeCard').style.display = 'none';

    const form = document.getElementById('categoryForm');
    form.categoryId.value = id;
    form.categoryId.disabled = true;
    form.title.value = category.baslik;
    form.icon.value = category.icon;
    form.description.value = category.aciklama;
    form.dataset.editing = 'true';
    document.getElementById('categoryFormTitle').textContent = 'Kategoriyi Düzenle';
}

// Kategori sil
function deleteCategory(id) {
    if (!siteData?.terapiNotlari?.[id]) return;
    if (!confirm('Kategoriyi silmek istediğinize emin misiniz?')) return;

    delete siteData.terapiNotlari[id];
    saveData().then(saved => {
        if (saved) {
            updateCategoryList();
            updateCategorySelect();
            showSuccess('Kategori silindi');
        }
    });
}

// Alt kategori düzenle
function editSubcategory(parentId, subId) {
    const category = siteData?.terapiNotlari?.[parentId];
    const sub = category?.altKategoriler.find(s => s.id === subId);
    if (!sub) return;

    const formCard = document.getElementById('subcategoryFormCard');
    formCard.style.display = 'block';
    setTimeout(() => formCard.classList.add('show'), 10);
    
    document.getElementById('categoryFormCard').style.display = 'none';
    document.getElementById('welcomeCard').style.display = 'none';

    const form = document.getElementById('subcategoryForm');
    form.parentCategory.value = parentId;
    form.subcategoryTitle.value = sub.baslik;
    form.subcategoryStatus.value = sub.durum;
    form.subcategoryDescription.value = sub.aciklama;
    form.subcategoryContent.value = sub.icerik || '';
    form.dataset.editing = 'true';
    form.dataset.originalParent = parentId;
    form.dataset.originalId = subId;
    document.getElementById('subcategoryFormTitle').textContent = 'Alt Kategoriyi Düzenle';
}

// Alt kategori sil
function deleteSubcategory(parentId, subId) {
    const category = siteData?.terapiNotlari?.[parentId];
    if (!category) return;
    if (!confirm('Alt kategoriyi silmek istediğinize emin misiniz?')) return;

    category.altKategoriler = category.altKategoriler.filter(s => s.id !== subId);
    saveData().then(saved => {
        if (saved) {
            updateCategoryList();
            showSuccess('Alt kategori silindi');
        }
    });
}

// Navbar functionality
document.addEventListener('DOMContentLoaded', function() {
    // Current date and time
    function updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        document.getElementById('currentDateTime').textContent = now.toLocaleDateString('tr-TR', options);
    }
    
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute

    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const icon = this.querySelector('i');
            if (document.body.classList.contains('dark-mode')) {
                icon.classList.replace('fa-moon', 'fa-sun');
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
            }
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        });

        // Check for saved dark mode preference
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
            darkModeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        }
    }

    // Notifications
    const notificationsBtn = document.getElementById('notificationsBtn');
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Notification logic will be implemented here
        });
    }
});