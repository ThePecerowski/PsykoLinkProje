// Blog sayfası için JavaScript kodları
document.addEventListener('DOMContentLoaded', function() {
    // Blog verilerini yükle
    loadBlogPosts();

    // Bilgilendirme banner'ını kapatma işlevi
    initInfoBanner();

    // Psikolog giriş sistemi
    initLoginSystem();

    // Arama fonksiyonalitesi
    const searchInput = document.getElementById('blogSearch');
    searchInput?.addEventListener('input', debounce(function() {
        const searchQuery = this.value.trim().toLowerCase();
        searchPosts(searchQuery);
    }, 300));

    // Kategori filtresi
    const categorySelect = document.getElementById('categoryFilter');
    categorySelect?.addEventListener('change', function() {
        const selectedCategory = this.value;
        const searchQuery = document.getElementById('blogSearch')?.value.trim().toLowerCase() || '';
        filterPostsByCategory(selectedCategory, searchQuery);
    });    // Paylaş butonları - Event delegation kullanarak dinamik içerikler için de çalışır
    document.addEventListener('click', function(e) {
        // Tıklanan eleman veya üst elementi .share-button sınıfına sahipse
        const shareButton = e.target.closest('.share-button');
        
        if (shareButton) {
            e.preventDefault();
            e.stopPropagation();
            
            // En yakın blog card elementini bul
            const postCard = shareButton.closest('.blog-card');
            
            if (!postCard) return;
            
            // Post ID'sini al
            const postId = postCard.dataset.id || shareButton.dataset.id || '1';
            
            // Post bilgilerini al
            const postTitle = postCard.querySelector('.card-title').textContent;
            const postLink = window.location.origin + '/blog-post.html?id=' + postId;
            
            // Tıklama animasyonu ekle
            addRippleEffect(shareButton, e);
            
            // Paylaşım modalını aç ve bilgileri doldur
            openShareModal(postTitle, postLink);
        }
    });
      // Paylaşım modalındaki paylaş butonları - Event delegation ile
    document.addEventListener('click', function(e) {
        const shareBtn = e.target.closest('.share-btn');
        
        if (shareBtn) {
            const platform = shareBtn.getAttribute('data-platform');
            const url = document.getElementById('shareUrlInput').value;
            const title = document.querySelector('.share-post-title').textContent;
            
            // Tıklama animasyonu ekle
            addRippleEffect(shareBtn, e);
            
            // Paylaşım işlemini gerçekleştir
            shareContent(platform, url, title);
        }
    });
      // URL kopyalama butonu - Event delegation ile
    document.addEventListener('click', function(e) {
        const copyBtn = e.target.closest('#copyShareUrl');
        
        if (copyBtn) {
            const urlInput = document.getElementById('shareUrlInput');
            copyToClipboard(urlInput.value);
            
            // Tıklama animasyonu ekle
            addRippleEffect(copyBtn, e);
        }
    });

    // Kaydet butonları
    document.querySelectorAll('.save-button').forEach(button => {
        button.addEventListener('click', function(e) {
            const button = e.target.closest('.save-button');
            const icon = button.querySelector('i');
           
            if (icon.classList.contains('far')) {
                icon.classList.replace('far', 'fas');
                showToast('Yazı kaydedildi');
            } else {
                icon.classList.replace('fas', 'far');
                showToast('Yazı kayıtlardan kaldırıldı');
            }
        });
    });
    
    // Blog yazısı önizleme butonu
    document.getElementById('previewBtn')?.addEventListener('click', function() {
        previewBlogPost();
    });
});

// Bilgilendirme banner'ını kapatma işlevi
function initInfoBanner() {
    const closeButton = document.querySelector('.info-banner-close');
    const infoBanner = document.querySelector('.info-banner');
    
    if (closeButton && infoBanner) {
        // Local storage'dan banner durumunu kontrol et
        const isBannerClosed = localStorage.getItem('infoBannerClosed') === 'true';
        
        // Eğer banner daha önce kapatılmışsa gizle
        if (isBannerClosed) {
            infoBanner.style.display = 'none';
        }
        
        // Kapatma butonuna tıklama olayı ekle
        closeButton.addEventListener('click', function() {
            // Yumuşak bir şekilde banner'ı kapat
            infoBanner.style.opacity = '0';
            setTimeout(() => {
                infoBanner.style.display = 'none';
                // Banner durumunu local storage'a kaydet
                localStorage.setItem('infoBannerClosed', 'true');
            }, 300);
        });
    }
}

// Psikolog giriş sistemini başlat
function initLoginSystem() {
    const blogWriterLoginButton = document.getElementById('blogWriterLogin');
    const loginForm = document.getElementById('loginForm');
    const togglePasswordButton = document.getElementById('togglePassword');
    const loginErrorAlert = document.getElementById('loginError');
    const writerModeToolbar = document.getElementById('writerModeToolbar');
    const logoutButton = document.getElementById('logoutBtn');
    const newPostButton = document.getElementById('newPostBtn');
    const saveNewPostButton = document.getElementById('saveNewPost');
    const saveEditedPostButton = document.getElementById('saveEditedPost');
    
    // Kullanıcı zaten giriş yapmışsa yazar modunu aktifleştir
    if (isLoggedIn()) {
        activateWriterMode();
    }

    // Login modal göster
    blogWriterLoginButton?.addEventListener('click', function(e) {
        e.preventDefault();
        if (isLoggedIn()) {
            // Eğer zaten giriş yapmışsa, çıkış yapmak isteyip istemediğini sor
            if (confirm('Çıkış yapmak istiyor musunuz?')) {
                logout();
            }
        } else {
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
        }
    });

    // Şifre göster/gizle butonu
    togglePasswordButton?.addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });

    // Login form submission
    loginForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Giriş bilgilerini kontrol et
        checkLoginCredentials(username, password)
            .then(isValid => {
                if (isValid) {
                    // Giriş başarılı
                    loginErrorAlert.classList.add('d-none');
                    
                    // Kullanıcı bilgilerini localStorage'a kaydet
                    localStorage.setItem('blogWriter', JSON.stringify({
                        username: username,
                        isLoggedIn: true,
                        loginTime: new Date().toISOString()
                    }));
                    
                    // Modal kapat
                    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                    loginModal.hide();
                    
                    // Yazar modunu aktifleştir
                    activateWriterMode();
                    
                    showToast('Başarıyla giriş yaptınız', 'success');
                } else {
                    // Giriş başarısız
                    loginErrorAlert.classList.remove('d-none');
                }
            })
            .catch(error => {
                console.error('Giriş hatası:', error);
                showToast('Bir hata oluştu. Lütfen tekrar deneyin.', 'danger');
            });
    });
    
    // Çıkış butonu
    logoutButton?.addEventListener('click', function() {
        logout();
    });
    
    // Yeni yazı butonu
    newPostButton?.addEventListener('click', function() {
        // Yeni yazı modalını göster
        const newPostModal = new bootstrap.Modal(document.getElementById('newPostModal'));
        
        // Form alanlarını temizle
        document.getElementById('newPostForm').reset();
        
        // Yazar adını otomatik doldur
        const userData = JSON.parse(localStorage.getItem('blogWriter') || '{}');
        if (userData.username) {
            // Admin ise "Admin" olarak ayarla
            if (userData.username === 'admin') {
                document.getElementById('postAuthor').value = 'Admin';
            } else {
                // Terapist ID'sinden ismini bul ve ayarla
                fetchTherapistName(userData.username)
                    .then(name => {
                        if (name) {
                            document.getElementById('postAuthor').value = name;
                        }
                    });
            }
        }
        
        newPostModal.show();
    });
    
    // Yeni yazı kaydet butonu
    saveNewPostButton?.addEventListener('click', function() {
        const form = document.getElementById('newPostForm');
        
        // Form doğrulaması
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Form verilerini al
        const postData = {
            title: document.getElementById('postTitle').value,
            category: document.getElementById('postCategory').value,
            author: document.getElementById('postAuthor').value,
            excerpt: document.getElementById('postExcerpt').value,
            content: document.getElementById('postContent').value,
            tags: document.getElementById('postTags').value.split(',').map(tag => tag.trim()),
            image: document.getElementById('postImage').value || 'images/blog/default.jpg',
            featured: document.getElementById('postFeatured').checked
        };      // Yazıyı kaydet
        saveNewBlogPost(postData)
            .then(success => {
                if (success) {
                    // Modal kapat
                    const modal = bootstrap.Modal.getInstance(document.getElementById('newPostModal'));
                    modal.hide();
                    
                    // Başarı mesajı göster
                    showToast('Yazı başarıyla eklendi', 'success');
                    
                    // Sayfayı yenile
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                } else {
                    showToast('Yazı eklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.', 'danger');
                }
            })
            .catch(error => {
                console.error('Yazı ekleme hatası:', error);
                showToast('Yazı eklenirken bir teknik sorun oluştu: ' + error.message, 'danger');
            });
    });
    
    // Düzenlenen yazıyı kaydet butonu
    saveEditedPostButton?.addEventListener('click', function() {
        const form = document.getElementById('editPostForm');
        
        // Form doğrulaması
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Form verilerini al
        const postId = document.getElementById('editPostId').value;
        const postData = {
            id: postId,
            title: document.getElementById('editPostTitle').value,
            category: document.getElementById('editPostCategory').value,
            author: document.getElementById('editPostAuthor').value,
            excerpt: document.getElementById('editPostExcerpt').value,
            content: document.getElementById('editPostContent').value,
            tags: document.getElementById('editPostTags').value.split(',').map(tag => tag.trim()),
            image: document.getElementById('editPostImage').value,
            featured: document.getElementById('editPostFeatured').checked
        };
        
        // Yazıyı güncelle
        updateBlogPost(postId, postData)
            .then(success => {
                if (success) {
                    // Modal kapat
                    const modal = bootstrap.Modal.getInstance(document.getElementById('editPostModal'));
                    modal.hide();
                    
                    // Başarı mesajı göster
                    showToast('Yazı başarıyla güncellendi', 'success');
                    
                    // Sayfayı yenile
                    setTimeout(() => {
                        location.reload();
                    }, 1000);                } else {
                    showToast('Yazı güncellenirken bir hata oluştu. Lütfen konsolu kontrol edin.', 'danger');
                }
            })            .catch(error => {
                console.error('Yazı güncelleme hatası:', error);
                showToast('Yazı güncellenirken bir hata oluştu: ' + error.message, 'danger');
            });
    });
}

// Kullanıcının giriş yapıp yapmadığını kontrol et
function isLoggedIn() {
    const userData = localStorage.getItem('blogWriter');
    if (!userData) return false;
    
    try {
        const user = JSON.parse(userData);
        // 24 saat içinde giriş yapmış mı kontrol et
        const loginTime = new Date(user.loginTime);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
        
        return user.isLoggedIn && hoursDiff < 24;
    } catch (error) {
        console.error('Kullanıcı verisi parse hatası:', error);
        return false;
    }
}

// Giriş bilgilerini kontrol et
async function checkLoginCredentials(username, password) {
    try {
        // data.json'dan admin bilgilerini al
        const response = await fetch('./data.json', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            cache: 'no-store'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Admin kullanıcısı bilgilerini kontrol et
        if (data.admin && data.admin.username === username && data.admin.password === password) {
            console.log('Admin girişi başarılı');
            return true;
        }
        
        // Terapist bilgilerini kontrol et (eğer terapistlerin ayrı erişimi varsa)
        if (data.terapistler) {
            const allTherapists = [
                ...data.terapistler.bireysel || [],
                ...data.terapistler.cift || [],
                ...data.terapistler.aile || []
            ];
            
            // Kullanıcı adı olarak terapistin ID'sini kontrol et
            const therapist = allTherapists.find(t => t.id === username);
            
            // Eğer terapist bulunduysa ve terapist için özel şifre tanımlanmışsa kontrol et
            if (therapist) {
                if (therapist.sifre && therapist.sifre === password) {
                    console.log('Terapist girişi başarılı (özel şifre)');
                    return true;
                }
                
                // Özel şifre yoksa varsayılan şifre kontrolü (ismin ilk harfi + soyad)
                const names = therapist.isim.split(' ');
                const lastName = names[names.length - 1];
                const defaultPassword = (names[0][0] + lastName).toLowerCase();
                
                if (defaultPassword === password) {
                    console.log('Terapist girişi başarılı (varsayılan şifre)');
                    return true;
                }
            }
        }
        
        console.log('Giriş başarısız: Hatalı kullanıcı adı veya şifre');
        return false;
    } catch (error) {
        console.error('Giriş doğrulama hatası:', error);
        return false;
    }
}

// Yazar modunu aktifleştir
function activateWriterMode() {
    const writerModeToolbar = document.getElementById('writerModeToolbar');
    const blogWriterLoginButton = document.getElementById('blogWriterLogin');
    
    if (writerModeToolbar && blogWriterLoginButton) {
        writerModeToolbar.classList.remove('d-none');
        document.body.classList.add('edit-mode');
        
        // Login butonunu değiştir
        blogWriterLoginButton.innerHTML = '<i class="fas fa-user-check"></i> Yazar Modu Aktif';
        blogWriterLoginButton.classList.add('text-success');
        
        // Blog kartlarına edit butonları ekle
        addEditButtonsToBlogCards();
    }
}

// Yazar modunu deaktive et
function deactivateWriterMode() {
    const writerModeToolbar = document.getElementById('writerModeToolbar');
    const blogWriterLoginButton = document.getElementById('blogWriterLogin');
    
    if (writerModeToolbar && blogWriterLoginButton) {
        writerModeToolbar.classList.add('d-none');
        document.body.classList.remove('edit-mode');
        
        // Login butonunu eski haline getir
        blogWriterLoginButton.innerHTML = '<i class="fas fa-lock"></i> Psikolog Girişi';
        blogWriterLoginButton.classList.remove('text-success');
        
        // Edit butonlarını kaldır
        removeEditButtonsFromBlogCards();
    }
}

// Blog kartlarına düzenleme butonları ekle
function addEditButtonsToBlogCards() {
    document.querySelectorAll('.blog-card').forEach(card => {
        // Eğer zaten butonlar eklenmişse tekrar ekleme
        if (card.querySelector('.post-actions')) return;
        
        const postId = card.querySelector('.share-button')?.dataset.id || '';
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'post-actions';
        actionsDiv.innerHTML = `
            <button type="button" class="edit-post-btn" data-id="${postId}" title="Düzenle">
                <i class="fas fa-edit text-primary"></i>
            </button>
            <button type="button" class="delete-post-btn" data-id="${postId}" title="Sil">
                <i class="fas fa-trash text-danger"></i>
            </button>
        `;
        
        card.querySelector('.card').appendChild(actionsDiv);
        
        // Düzenleme butonu tıklama olayı
        actionsDiv.querySelector('.edit-post-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            const postId = this.dataset.id;
            editPost(postId);
        });
        
        // Silme butonu tıklama olayı
        actionsDiv.querySelector('.delete-post-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            const postId = this.dataset.id;
            deletePost(postId);
        });
    });
}

// Blog kartlarından düzenleme butonlarını kaldır
function removeEditButtonsFromBlogCards() {
    document.querySelectorAll('.post-actions').forEach(actions => {
        actions.remove();
    });
}

// Yazı düzenleme fonksiyonu
function editPost(postId) {
    // Blog yazısı bilgilerini getir
    fetchBlogPost(postId)
        .then(post => {
            if (!post) {
                showToast('Yazı bilgisi bulunamadı', 'danger');
                return;
            }
            
            // Form alanlarını doldur
            document.getElementById('editPostId').value = post.id;
            document.getElementById('editPostTitle').value = post.title;
            document.getElementById('editPostCategory').value = post.category;
            document.getElementById('editPostAuthor').value = post.author;
            document.getElementById('editPostExcerpt').value = post.excerpt;
            document.getElementById('editPostContent').value = post.content;
            document.getElementById('editPostTags').value = post.tags.join(', ');
            document.getElementById('editPostImage').value = post.image;
            document.getElementById('editPostFeatured').checked = post.featured;
            
            // Modalı göster
            const editPostModal = new bootstrap.Modal(document.getElementById('editPostModal'));
            editPostModal.show();
        })
        .catch(error => {
            console.error('Yazı bilgisi getirme hatası:', error);
            showToast('Yazı bilgisi alınırken bir hata oluştu', 'danger');
        });
}

// Yazı silme fonksiyonu
function deletePost(postId) {
    if (confirm('Bu yazıyı silmek istediğinize emin misiniz?')) {
        // Yazıyı sil
        deleteBlogPost(postId)
            .then(success => {
                if (success) {
                    showToast('Yazı başarıyla silindi', 'success');
                    
                    // Yazı kartını sayfadan kaldır
                    const blogCard = document.querySelector(`.blog-card[data-id="${postId}"]`);
                    if (blogCard) {
                        blogCard.remove();
                    } else {
                        // Kart bulunamazsa sayfayı yenile
                        setTimeout(() => {
                            location.reload();
                        }, 1000);
                    }
                } else {
                    showToast('Yazı silinirken bir hata oluştu', 'danger');
                }
            })
            .catch(error => {
                console.error('Yazı silme hatası:', error);
                showToast('Yazı silinirken bir hata oluştu', 'danger');
            });
    }
}

// Çıkış yapma fonksiyonu
function logout() {
    // LocalStorage'dan kullanıcı bilgilerini sil
    localStorage.removeItem('blogWriter');
    
    // Yazar modunu deaktive et
    deactivateWriterMode();
    
    showToast('Başarıyla çıkış yaptınız', 'info');
}

// Blog yazısı bilgilerini getir
async function fetchBlogPost(postId) {
    try {
        // Mutlak yol kullanarak data.json'ı getir
        const response = await fetch('./data.json', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            cache: 'no-store'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // ID'ye göre blog yazısını bul
        return data.blogPosts.find(post => post.id === postId);
    } catch (error) {
        console.error('Blog yazısı getirme hatası:', error);
        throw error;
    }
}

// Yeni blog yazısı kaydet
async function saveNewBlogPost(postData) {
    try {
        // Yeni ID oluştur
        const slug = createSlug(postData.title);
        const id = slug;
        
        // Bugünün tarihini ekle
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        // Yazı verisini hazırla
        const newPost = {
            id: id,
            title: postData.title,
            slug: slug,
            category: postData.category,
            categorySlug: createSlug(postData.category),
            author: postData.author,
            date: formattedDate,
            readingTime: estimateReadingTime(postData.content),
            image: postData.image,
            excerpt: postData.excerpt,
            content: postData.content,
            tags: postData.tags,
            metaDescription: postData.excerpt,
            featured: postData.featured
        };
          // data.json'ı getir
        const response = await fetch('./data.json', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            cache: 'no-store'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
          // Yeni yazıyı ekle
        data.blogPosts.push(newPost);
        
        // data.json'ı güncelle
        const saveResponse = await saveDataToServer(data);
        
        if (!saveResponse.success) {
            console.error('Sunucu yanıt hatası:', saveResponse.error);
            throw new Error(saveResponse.error || 'Bilinmeyen sunucu hatası');
        }
        return true;
    } catch (error) {
        console.error('Yeni yazı kaydetme hatası:', error);
        return false;
    }
}

// Blog yazısını güncelle
async function updateBlogPost(postId, postData) {
    try {        // data.json'ı getir
        const response = await fetch('./data.json', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            cache: 'no-store'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Yazı dizinini bul
        const postIndex = data.blogPosts.findIndex(post => post.id === postId);
        
        if (postIndex === -1) {
            return false;
        }
        
        // Slug oluştur
        const slug = createSlug(postData.title);
        
        // Yazıyı güncelle
        data.blogPosts[postIndex] = {
            ...data.blogPosts[postIndex],
            title: postData.title,
            slug: slug,
            category: postData.category,
            categorySlug: createSlug(postData.category),
            author: postData.author,
            excerpt: postData.excerpt,
            content: postData.content,
            tags: postData.tags,
            image: postData.image,
            metaDescription: postData.excerpt,
            featured: postData.featured        };          // data.json'ı güncelle
        const saveResponse = await saveDataToServer(data);
        
        if (!saveResponse.success) {
            console.error('Sunucu yanıt hatası:', saveResponse.error);
            throw new Error(saveResponse.error || 'Bilinmeyen sunucu hatası');
        }
        return true;
    } catch (error) {
        console.error('Yazı güncelleme hatası:', error);
        return false;
    }
}

// Blog yazısını sil
async function deleteBlogPost(postId) {
    try {
        // data.json'ı getir
        const response = await fetch('./data.json', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            cache: 'no-store'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Yazıyı filtrele
        data.blogPosts = data.blogPosts.filter(post => post.id !== postId);
        
        // data.json'ı güncelle
        const saveResponse = await saveDataToServer(data);
        
        if (!saveResponse.success) {
            console.error('Sunucu yanıt hatası:', saveResponse.error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Yazı silme hatası:', error);
        return false;
    }
}

// Terapist ID'den isim getir
async function fetchTherapistName(therapistId) {
    try {
        const response = await fetch('./data.json', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            cache: 'no-store'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Tüm terapistleri birleştir
        const allTherapists = [
            ...data.terapistler.bireysel || [],
            ...data.terapistler.cift || [],
            ...data.terapistler.aile || []
        ];
        
        // ID'ye göre terapisti bul
        const therapist = allTherapists.find(t => t.id === therapistId);
        
        return therapist ? therapist.isim : null;
    } catch (error) {
        console.error('Terapist bilgisi getirme hatası:', error);
        return null;
    }
}

// Data'yı server'a kaydet
async function saveDataToServer(data) {
    try {
        // Veriyi sunucuya gönder
        const response = await fetch('./save-data.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            cache: 'no-store',
            body: JSON.stringify(data)
        });
        
        // Yanıtı metin olarak al
        const text = await response.text();
        
        try {
            // Boş yanıt kontrolü
            if (!text || text.trim() === '') {
                console.error('Sunucudan boş yanıt geldi');
                return { success: false, error: 'Sunucudan boş yanıt geldi' };
            }
            
            // JSON yanıtını parse et
            const jsonResponse = JSON.parse(text);
            
            // Yanıt başarılı mı kontrolü
            if (!jsonResponse.success) {
                console.error('Sunucu işlem hatası:', jsonResponse.error || 'Belirtilmemiş hata');
            }
            
            return jsonResponse;
        } catch (parseError) {
            console.error('JSON parse hatası:', parseError, 'Ham yanıt:', text);
            return { success: false, error: 'JSON parse hatası: ' + parseError.message };
        }
    } catch (error) {
        console.error('Data kaydetme hatası:', error);
        return { success: false, error: error.message };
    }
}

// Slug oluştur
function createSlug(text) {
    return text
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// Okuma süresini tahmin et
function estimateReadingTime(content) {
    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // Ortalama okuma hızı: 200 kelime/dakika
    return readingTime.toString();
}

// Yeni yazı modalını göster
function showNewPostModal() {
    // TODO: Yeni yazı ekleme modalını göster
    showToast('Yeni yazı ekleme özelliği yakında eklenecek', 'info');
}

// Blog yazılarını yükle
async function loadBlogPosts() {
    try {
        // Mutlak yol kullanarak data.json'ı getir (tarayıcı yolunu baz alarak)
        const response = await fetch('./data.json', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Blog verilerini kontrol et
        if (!data || !data.blogPosts || !Array.isArray(data.blogPosts)) {
            throw new Error('Geçersiz blog verisi formatı.');
        }

        displayFeaturedPosts(data.blogPosts);
        displayRecentPosts(data.blogPosts);
        setupCategoryFilter(data.blogPosts);
    } catch (error) {
        console.error('Blog yazıları yüklenirken hata:', error);

        // Hata mesajını kullanıcıya göster
        const errorContainer = document.getElementById('errorContainer');
        if (errorContainer) {
            errorContainer.textContent = 'Blog yazıları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
            errorContainer.style.display = 'block';
        }
    }
}

// Öne çıkan yazıları göster
function displayFeaturedPosts(posts) {
    const featuredPosts = posts.filter(post => post.featured);
    const featuredContainer = document.querySelector('.featured-posts .row');
    
    if (featuredContainer) {
        // Add index to each featured post for staggered animations
        const postsWithIndex = featuredPosts.map((post, index) => ({...post, index}));
        featuredContainer.innerHTML = postsWithIndex.map(post => createBlogCard(post, true)).join('');
        
        // Refresh AOS to detect new elements
        if (typeof AOS !== 'undefined') {
            setTimeout(() => {
                AOS.refresh();
            }, 100);
        }
    }
}

// Son yazıları göster
function displayRecentPosts(posts) {
    const recentPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    const postsContainer = document.getElementById('blogPosts');
    
    if (postsContainer) {
        // Add index to each post for staggered animations
        const postsWithIndex = recentPosts.map((post, index) => ({...post, index}));
        postsContainer.innerHTML = postsWithIndex.map(post => createBlogCard(post, false)).join('');
        
        // Refresh AOS to detect new elements
        if (typeof AOS !== 'undefined') {
            setTimeout(() => {
                AOS.refresh();
            }, 100);
        }
    }
}

// Kategori filtresini ayarla
function setupCategoryFilter(posts) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;

    // Benzersiz kategorileri al
    const categories = [...new Set(posts.map(post => post.category))];
    
    // Kategorileri alfabetik sıraya göre sırala
    categories.sort();

    // Kategori seçeneklerini oluştur
    const options = categories.map(category => {
        const slug = category.toLowerCase().replace(/\s+/g, '-').replace(/[ğüşıöçĞÜŞİÖÇ]/g, c => {
            return { 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ı': 'i', 'ö': 'o', 'ç': 'c',
                    'Ğ': 'G', 'Ü': 'U', 'Ş': 'S', 'İ': 'I', 'Ö': 'O', 'Ç': 'C' }[c];
        });
        return `<option value="${slug}">${category}</option>`;
    });

    // Varsayılan seçeneği ekle
    categoryFilter.innerHTML = '<option value="">Tüm Kategoriler</option>' + options.join('');

    // Kategori değişiklikleri için olay dinleyicisi ekle
    categoryFilter.addEventListener('change', function() {
        const selectedCategory = this.value;
        filterPosts(posts, selectedCategory);
    });
}

// Yazıları kategoriye göre filtrele
function filterPosts(posts, categorySlug) {
    let filteredPosts = posts;
    
    if (categorySlug) {
        filteredPosts = posts.filter(post => {
            const postCategorySlug = post.category.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[ğüşıöçĞÜŞİÖÇ]/g, c => {
                    return { 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ı': 'i', 'ö': 'o', 'ç': 'c',
                            'Ğ': 'G', 'Ü': 'U', 'Ş': 'S', 'İ': 'I', 'Ö': 'O', 'Ç': 'C' }[c];
                });
            return postCategorySlug === categorySlug;
        });
    }

    // Hem öne çıkan hem de son yazılar bölümünü güncelle
    displayFeaturedPosts(filteredPosts);
    displayRecentPosts(filteredPosts);

    // Yazı sayısını güncelle
    updatePostsCount(filteredPosts.length);
}

// Yazıları anahtar kelimeye göre ara
async function searchPosts(query) {
    if (!query) {
        // Arama sorgusu boşsa tüm yazıları göster
        loadBlogPosts();
        return;
    }
    
    try {
        const response = await fetch('./data.json', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            cache: 'no-store'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Yazıları başlık, özet, içerik ve etiketlere göre filtrele
        const filteredPosts = data.blogPosts.filter(post => {
            const title = post.title.toLowerCase();
            const excerpt = post.excerpt.toLowerCase();
            const content = post.content.toLowerCase();
            const tags = post.tags.join(' ').toLowerCase();
            const category = post.category.toLowerCase();
            const author = post.author.toLowerCase();
            
            return title.includes(query) || 
                   excerpt.includes(query) || 
                   content.includes(query) || 
                   tags.includes(query) || 
                   category.includes(query) || 
                   author.includes(query);
        });
        
        // Sonuçları göster
        displayFeaturedPosts(filteredPosts);
        displayRecentPosts(filteredPosts);
        updatePostsCount(filteredPosts.length);
        
    } catch (error) {
        console.error('Arama yaparken hata:', error);
        showToast('Arama yapılırken bir hata oluştu', 'danger');
    }
}

// Kategori ve arama sorgusu ile yazıları filtrele
async function filterPostsByCategory(categorySlug, searchQuery) {
    try {
        const response = await fetch('./data.json', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            cache: 'no-store'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        let filteredPosts = data.blogPosts;
        
        // Kategoriye göre filtrele
        if (categorySlug) {
            filteredPosts = filteredPosts.filter(post => {
                const postCategorySlug = post.category.toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[ğüşıöçĞÜŞİÖÇ]/g, c => {
                        return { 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ı': 'i', 'ö': 'o', 'ç': 'c',
                                'Ğ': 'G', 'Ü': 'U', 'Ş': 'S', 'İ': 'I', 'Ö': 'O', 'Ç': 'C' }[c];
                    });
                return postCategorySlug === categorySlug;
            });
        }
        
        // Arama sorgusuna göre filtrele
        if (searchQuery) {
            filteredPosts = filteredPosts.filter(post => {
                const title = post.title.toLowerCase();
                const excerpt = post.excerpt.toLowerCase();
                const content = post.content.toLowerCase();
                const tags = post.tags.join(' ').toLowerCase();
                const category = post.category.toLowerCase();
                const author = post.author.toLowerCase();
                
                return title.includes(searchQuery) || 
                       excerpt.includes(searchQuery) || 
                       content.includes(searchQuery) || 
                       tags.includes(searchQuery) || 
                       category.includes(searchQuery) || 
                       author.includes(searchQuery);
            });
        }
        
        // Sonuçları göster
        displayFeaturedPosts(filteredPosts);
        displayRecentPosts(filteredPosts);
        updatePostsCount(filteredPosts.length);
        
    } catch (error) {
        console.error('Filtreleme yaparken hata:', error);
        showToast('Filtreleme yapılırken bir hata oluştu', 'danger');
    }
}

// Toast mesajı göster
function showToast(message, type = 'info', delay = 3000) {
    // Eğer önceki toast varsa sil
    const existingToast = document.querySelector('.toast-container');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Toast container oluştur
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    
    // Toast element oluştur
    const toastElement = document.createElement('div');
    toastElement.className = `toast align-items-center text-white bg-${type} border-0`;
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');
    
    // Toast içeriği oluştur
    toastElement.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Toast'u container'a ekle
    toastContainer.appendChild(toastElement);
    
    // Container'ı body'e ekle
    document.body.appendChild(toastContainer);
    
    // Toast'u göster
    const toast = new bootstrap.Toast(toastElement, {
        animation: true,
        autohide: true,
        delay: delay
    });
    toast.show();
}

// Hata mesajı göster
function showError(message) {
    showToast(message, 'danger');
}

// Debounce fonksiyonu
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);    };
}

// Yazı sayısını güncelle
function updatePostsCount(count) {
    const postsCountElement = document.getElementById('postsCount');
    if (postsCountElement) {
        postsCountElement.textContent = count;
    }
}

// Blog Post Page Functions
document.addEventListener('DOMContentLoaded', function() {
    // Share buttons functionality
    const shareButtons = document.querySelectorAll('.share-buttons a');
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const url = window.location.href;
            const title = document.querySelector('.blog-post-title').textContent;

            let shareUrl;
            if (this.querySelector('.fa-facebook-f')) {
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            } else if (this.querySelector('.fa-twitter')) {
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
            } else if (this.querySelector('.fa-whatsapp')) {
                shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`;
            } else if (this.querySelector('.fa-envelope')) {
                shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
            }

            window.open(shareUrl, '_blank', 'width=600,height=400');
        });
    });

    // Comment form handling
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('commentName').value;
            const email = document.getElementById('commentEmail').value;
            const comment = document.getElementById('commentText').value;

            // Here you would typically send this data to your backend
            console.log('Comment submitted:', { name, email, comment });

            // Clear the form
            this.reset();

            // Show success message
            alert('Yorumunuz başarıyla gönderildi. Onaylandıktan sonra yayınlanacaktır.');
        });
    }

    // Dynamic date formatting
    const dateElement = document.querySelector('.post-date');
    if (dateElement) {
        const date = new Date();
        dateElement.textContent = date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
});

// Blog kartı oluştur
function createBlogCard(post, isFeatured) {
    const date = new Date(post.date).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Calculate a delay based on post index to create staggered animation effect
    const delayIndex = post.index || 0;
    const delay = (delayIndex % 6) * 100; // 0, 100, 200, 300, 400, 500ms delays in a cycle

    return `
        <div class="col-md-6 col-lg-4" data-aos="${isFeatured ? 'fade-up' : 'fade-up'}" data-aos-delay="${delay}">
            <article class="blog-card ${isFeatured ? 'featured' : ''}" data-id="${post.id}">
                <div class="card h-100">
                    <a href="blog-post.html?id=${post.id}" class="card-img-link">
                        <img src="${post.image}" class="card-img-top" alt="${post.title}">
                    </a>
                    <div class="card-body">
                        <div class="card-meta">
                            <span class="category"><i class="fas fa-tag"></i> ${post.category}</span>
                            <span class="reading-time"><i class="far fa-clock"></i> ${post.readingTime} dk okuma</span>
                        </div>
                        <h3 class="card-title">
                            <a href="blog-post.html?id=${post.id}">${post.title}</a>
                        </h3>
                        <p class="card-text">${post.excerpt}</p>
                    </div>
                    <div class="card-footer">
                        <div class="post-meta">
                            <span class="date">${date}</span>
                            <div class="share-buttons">
                                <button class="btn btn-sm btn-outline-primary save-button" style="opacity: 0;" data-id="${post.id}">
                                    <i class="far fa-bookmark"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-primary share-button" data-id="${post.id}">
                                    <i class="fas fa-share-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    `;
}

// HTML Editor Fonksiyonları
function insertHtmlTag(textareaId, tag) {
    const textarea = document.getElementById(textareaId);
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let replacement = '';
    
    switch(tag) {
        case 'h2':
            replacement = `<h2>${selectedText || 'Başlık 2'}</h2>`;
            break;
        case 'h3':
            replacement = `<h3>${selectedText || 'Başlık 3'}</h3>`;
            break;
        case 'p':
            replacement = `<p>${selectedText || 'Paragraf metni'}</p>`;
            break;
        case 'strong':
            replacement = `<strong>${selectedText || 'Kalın metin'}</strong>`;
            break;
        case 'em':
            replacement = `<em>${selectedText || 'İtalik metin'}</em>`;
            break;
        case 'u':
            replacement = `<u>${selectedText || 'Altı çizili metin'}</u>`;
            break;
        case 'ul':
            replacement = `<ul>\n\t<li>Liste öğesi 1</li>\n\t<li>Liste öğesi 2</li>\n\t<li>Liste öğesi 3</li>\n</ul>`;
            break;
        case 'ol':
            replacement = `<ol>\n\t<li>Liste öğesi 1</li>\n\t<li>Liste öğesi 2</li>\n\t<li>Liste öğesi 3</li>\n</ol>`;
            break;
        case 'li':
            replacement = `<li>${selectedText || 'Liste öğesi'}</li>`;
            break;
        case 'blockquote':
            replacement = `<blockquote class="blockquote">\n\t<p>${selectedText || 'Alıntı metni'}</p>\n\t<footer class="blockquote-footer">Kaynak <cite title="Kaynak Başlık">Kaynak Başlık</cite></footer>\n</blockquote>`;
            break;
        case 'code':
            replacement = `<pre><code>${selectedText || 'Kod bloğu'}</code></pre>`;
            break;
        default:
            replacement = `<${tag}>${selectedText || 'Metin'}</${tag}>`;
    }
    
    textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    textarea.focus();
    textarea.selectionStart = start + replacement.length;
    textarea.selectionEnd = start + replacement.length;
}

function insertLink(textareaId) {
    const textarea = document.getElementById(textareaId);
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    const url = prompt('Bağlantı URL:', 'https://');
    if (url) {
        const linkText = selectedText || 'Bağlantı metni';
        const linkHtml = `<a href="${url}" target="_blank">${linkText}</a>`;
        
        textarea.value = textarea.value.substring(0, start) + linkHtml + textarea.value.substring(end);
        textarea.focus();
        textarea.selectionStart = start + linkHtml.length;
        textarea.selectionEnd = start + linkHtml.length;
    }
}

function insertImage(textareaId) {
    const textarea = document.getElementById(textareaId);
    const start = textarea.selectionStart;
    
    // Gelişmiş görsel ekleme modalı oluştur
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'insertImageModal';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-labelledby', 'insertImageModalLabel');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="insertImageModalLabel">Görsel Ekle</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <ul class="nav nav-tabs" id="imageSourceTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="url-tab" data-bs-toggle="tab" data-bs-target="#url-panel" type="button" role="tab">URL ile Ekle</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="upload-tab" data-bs-toggle="tab" data-bs-target="#upload-panel" type="button" role="tab">Bilgisayardan Yükle</button>
                        </li>
                    </ul>
                    <div class="tab-content mt-3" id="imageSourceContent">
                        <div class="tab-pane fade show active" id="url-panel" role="tabpanel">
                            <div class="mb-3">
                                <label for="imageUrl" class="form-label">Görsel URL'i</label>
                                <input type="text" class="form-control" id="imageUrl" placeholder="https://..." value="images/blog/">
                            </div>
                        </div>
                        <div class="tab-pane fade" id="upload-panel" role="tabpanel">
                            <div class="mb-3">
                                <label for="imageFileUpload" class="form-label">Görsel Seçin</label>
                                <input type="file" class="form-control" id="imageFileUpload" accept="image/*">
                            </div>
                            <div class="progress d-none" id="uploadProgress">
                                <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 0%"></div>
                            </div>
                        </div>
                        <div class="mb-3 mt-3">
                            <label for="imageAltText" class="form-label">Alternatif Metin (SEO için önemli)</label>
                            <input type="text" class="form-control" id="imageAltText" placeholder="Görselin açıklaması">
                        </div>
                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" id="imageCentered" checked>
                            <label class="form-check-label" for="imageCentered">Görseli ortala</label>
                        </div>
                        <div id="imagePreviewArea" class="text-center d-none mt-3">
                            <img src="" alt="Önizleme" id="insertImagePreview" class="img-fluid img-thumbnail" style="max-height: 200px;">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">İptal</button>
                    <button type="button" class="btn btn-primary" id="insertImageConfirm">Ekle</button>
                </div>
            </div>
        </div>
    `;
    
    // Modalı sayfaya ekle
    document.body.appendChild(modal);
    
    // Bootstrap modalı başlat
    const imageModal = new bootstrap.Modal(document.getElementById('insertImageModal'));
    imageModal.show();
    
    // URL değiştiğinde önizleme güncelleme
    const imageUrl = document.getElementById('imageUrl');
    const insertImagePreview = document.getElementById('insertImagePreview');
    const imagePreviewArea = document.getElementById('imagePreviewArea');
    
    imageUrl.addEventListener('change', function() {
        if (this.value) {
            insertImagePreview.src = this.value;
            imagePreviewArea.classList.remove('d-none');
        }
    });
    
    // Dosya yükleme
    const imageFileUpload = document.getElementById('imageFileUpload');
    const uploadProgress = document.getElementById('uploadProgress');
    
    imageFileUpload.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            // Dosya seçildiğinde progress bar göster
            uploadProgress.classList.remove('d-none');
            const progressBar = uploadProgress.querySelector('.progress-bar');
            progressBar.style.width = '0%';
            
            // FormData oluştur
            const formData = new FormData();
            formData.append('image', this.files[0]);
            
            // Yükleme isteği
            fetch('upload-image.php', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                // Yükleme tamamlandı
                progressBar.style.width = '100%';
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Başarılı yükleme
                    imageUrl.value = data.file.url;
                    insertImagePreview.src = data.file.url;
                    imagePreviewArea.classList.remove('d-none');
                    showToast('Görsel başarıyla yüklendi', 'success');
                } else {
                    // Hata
                    showToast(`Hata: ${data.message}`, 'error');
                }
            })
            .catch(error => {
                console.error('Yükleme hatası:', error);
                showToast('Görsel yüklenirken bir hata oluştu', 'error');
            })
            .finally(() => {
                // İşlem bittiğinde progress bar'ı gizle
                setTimeout(() => {
                    uploadProgress.classList.add('d-none');
                }, 1000);
            });
        }
    });
    
    // Ekle butonuna tıklandığında
    document.getElementById('insertImageConfirm').addEventListener('click', function() {
        const url = imageUrl.value;
        const alt = document.getElementById('imageAltText').value || 'Görsel';
        const centered = document.getElementById('imageCentered').checked;
        
        if (url) {
            let imageHtml;
            if (centered) {
                imageHtml = `<div class="text-center mb-4"><img src="${url}" alt="${alt}" class="img-fluid rounded"></div>`;
            } else {
                imageHtml = `<img src="${url}" alt="${alt}" class="img-fluid rounded mb-4">`;
            }
            
            textarea.value = textarea.value.substring(0, start) + imageHtml + textarea.value.substring(start);
            textarea.focus();
            textarea.selectionStart = start + imageHtml.length;
            textarea.selectionEnd = start + imageHtml.length;
            
            // Modal kapat
            imageModal.hide();
            
            // Modalı DOM'dan temizle
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 500);
        }
    });
    
    // Modal kapatıldığında temizle
    modal.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

// Görsel yükleme fonksiyonları
function initImageUpload() {
    // Yeni post için görsel yükleme
    const uploadImageBtn = document.getElementById('uploadImageBtn');
    const imageUploadInput = document.getElementById('imageUploadInput');
    const postImageInput = document.getElementById('postImage');
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');

    // Düzenleme için görsel yükleme
    const editUploadImageBtn = document.getElementById('editUploadImageBtn');
    const editImageUploadInput = document.getElementById('editImageUploadInput');
    const editPostImageInput = document.getElementById('editPostImage');
    const editImagePreview = document.getElementById('editImagePreview');
    const editImagePreviewContainer = document.getElementById('editImagePreviewContainer');

    // Yeni post için upload butonu
    if (uploadImageBtn && imageUploadInput) {
        uploadImageBtn.addEventListener('click', function() {
            imageUploadInput.click();
        });

        imageUploadInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                handleImageUpload(
                    this.files[0], 
                    postImageInput, 
                    imagePreview, 
                    imagePreviewContainer
                );
            }
        });
    }

    // Düzenleme formu için upload butonu
    if (editUploadImageBtn && editImageUploadInput) {
        editUploadImageBtn.addEventListener('click', function() {
            editImageUploadInput.click();
        });

        editImageUploadInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                handleImageUpload(
                    this.files[0], 
                    editPostImageInput, 
                    editImagePreview, 
                    editImagePreviewContainer
                );
            }
        });
    }
}

// Görsel yükleme işlemini yönetir
function handleImageUpload(file, targetInput, previewImg, previewContainer) {
    // Yükleme durumunu göster
    showToast('Görsel yükleniyor...', 'info');
    
    // FormData oluştur
    const formData = new FormData();
    formData.append('image', file);
    
    // Yükleme isteği
    fetch('upload-image.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Başarılı yükleme
            targetInput.value = data.file.url;
            
            // Önizleme göster
            previewImg.src = data.file.url;
            previewImg.style.display = 'block';
            previewContainer.classList.remove('d-none');
            
            showToast('Görsel başarıyla yüklendi', 'success');
        } else {
            // Hata
            showToast(`Hata: ${data.message}`, 'error');
        }
    })
    .catch(error => {
        console.error('Yükleme hatası:', error);
        showToast('Görsel yüklenirken bir hata oluştu', 'error');
    });
}

// DOM yüklendiğinde görsel yükleme fonksiyonlarını başlat
document.addEventListener('DOMContentLoaded', function() {
    // Var olan diğer DOM yükleme fonksiyonları...
    
    // Görsel yükleme fonksiyonlarını başlat
    initImageUpload();
});

// Paylaşım modalını açma fonksiyonu
function openShareModal(postTitle, postLink) {
    // Modal elementlerini seç
    const shareModal = document.getElementById('shareModal');
    if (!shareModal) {
        console.error('Share modal element not found');
        return;
    }
    
    const titleElement = shareModal.querySelector('.share-post-title');
    const urlInput = shareModal.querySelector('#shareUrlInput');
    
    if (!titleElement || !urlInput) {
        console.error('Required elements in share modal not found');
        return;
    }
    
    // Modal içeriğini doldur
    titleElement.textContent = postTitle || 'Blog Yazısı';
    urlInput.value = postLink || window.location.href;
    
    // Tüm paylaşım butonlarını kontrol et
    shareModal.querySelectorAll('.share-btn').forEach(btn => {
        const platform = btn.getAttribute('data-platform');
        if (platform === 'instagram') {
            btn.setAttribute('title', 'Instagram için başlık ve link kopyala');
        } else {
            btn.setAttribute('title', `${platform.charAt(0).toUpperCase() + platform.slice(1)}'da paylaş`);
        }
    });
    
    // Modalı göster
    try {
        const bsModal = new bootstrap.Modal(shareModal);
        bsModal.show();
    } catch (err) {
        console.error('Error showing modal:', err);
        // Fallback for modal display if bootstrap is not available
        shareModal.style.display = 'block';
        shareModal.classList.add('show');
    }
}

// Farklı platformlarda içerik paylaşımı
function shareContent(platform, url, title) {
    let shareUrl = '';
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    
    switch(platform) {
        case 'whatsapp':
            shareUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20-%20${encodedUrl}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
            break;
        case 'gmail':
            shareUrl = `https://mail.google.com/mail/?view=cm&su=${encodedTitle}&body=${title}%0A%0A${encodedUrl}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
            break;
        case 'instagram':
            // Instagram doğrudan paylaşım linki desteklemediği için metni kopyala
            copyToClipboard(`${title} ${url}`);
            showToast(`Link ve başlık kopyalandı. Instagram'da paylaşabilirsiniz.`, 'success');
            return;
    }
    
    // Yeni pencerede paylaşım sayfasını aç
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=450');
        
        // Bootstrap modalını kapat
        const shareModal = bootstrap.Modal.getInstance(document.getElementById('shareModal'));
        if (shareModal) {
            setTimeout(() => shareModal.hide(), 500);
        }
        
        // Paylaşım bildirimini göster
        showShareToast(platform);
    }
}

// Panoya kopyalama işlevi
function copyToClipboard(text) {
    // Metin alanını seç (input mevcut ise)
    const urlInput = document.getElementById('shareUrlInput');
    if (urlInput) {
        urlInput.select();
        urlInput.setSelectionRange(0, 99999); // Mobil cihazlar için
    }
    
    // Kopyalama işlemi
    navigator.clipboard.writeText(text)
        .then(() => {
            // Başarılı kopyalama göstergesi
            const copyBtn = document.getElementById('copyShareUrl');
            if (copyBtn) {
                const icon = copyBtn.querySelector('i');
                
                // İkonu değiştir
                icon.classList.replace('far', 'fas');
                icon.classList.replace('fa-copy', 'fa-check');
                
                // Tooltip ekle
                const tooltip = document.createElement('div');
                tooltip.className = 'copy-tooltip';
                tooltip.textContent = 'Kopyalandı!';
                document.querySelector('.share-url-container').appendChild(tooltip);
                
                // Tooltip'i göster ve sonra gizle
                setTimeout(() => tooltip.classList.add('show'), 10);
                
                setTimeout(() => {
                    // İkonu eski haline getir
                    icon.classList.replace('fas', 'far');
                    icon.classList.replace('fa-check', 'fa-copy');
                    
                    // Tooltip'i kaldır
                    tooltip.classList.remove('show');
                    setTimeout(() => tooltip.remove(), 300);
                }, 2000);
            } else {
                // Copy button not found, show a toast instead
                showToast('İçerik kopyalandı!', 'success');
            }
        })
        .catch(err => {
            console.error('Kopyalama hatası:', err);
            showToast('Kopyalama işlemi başarısız oldu. Lütfen manuel olarak kopyalayın.', 'danger');
        });
}

// Paylaşım bildirimini gösterme
function showShareToast(platform) {
    // Platformun adını formatlama
    let platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
    let iconClass = '';
    
    // Platform için ikon sınıfı belirle
    switch(platform) {
        case 'whatsapp':
            iconClass = 'fab fa-whatsapp';
            break;
        case 'facebook':
            iconClass = 'fab fa-facebook';
            break;
        case 'twitter':
            iconClass = 'fab fa-twitter';
            break;
        case 'gmail':
            iconClass = 'fas fa-envelope';
            break;
        case 'linkedin':
            iconClass = 'fab fa-linkedin';
            break;
        case 'instagram':
            iconClass = 'fab fa-instagram';
            break;
        default:
            iconClass = 'fas fa-share-alt';
    }
    
    // Varsa mevcut toast'u kaldır
    const existingToast = document.querySelector('.share-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Yeni toast oluştur
    const toast = document.createElement('div');
    toast.className = 'share-toast';
    toast.innerHTML = `
        <div class="share-toast-icon">
            <i class="${iconClass}"></i>
        </div>
        <div class="share-toast-content">
            <div class="share-toast-title">Paylaşım Başarılı</div>
            <div class="share-toast-message">Yazı ${platformName}'ta paylaşıldı!</div>
        </div>
        <button class="share-toast-close" aria-label="Kapat">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Sayfaya ekle
    document.body.appendChild(toast);
    
    // Kapatma butonuna tıklama olayı ekle
    const closeButton = toast.querySelector('.share-toast-close');
    closeButton.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
    
    // Göster ve otomatik kapat
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000); // 4 saniye göster
}

// Tıklama dalgası efekti
function addRippleEffect(button, event) {
    const ripple = document.createElement('span');
    ripple.className = 'share-btn-ripple';
    
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}
