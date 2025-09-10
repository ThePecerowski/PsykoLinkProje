document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    
    // Get post ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    console.log('Post ID from URL:', postId);

    if (postId) {
        loadBlogPost(postId);
        setupScrollProgressBar();
        setupTableOfContents();
        setupDarkModeToggle();
        setupFontSizeControl();
        setupPrintButton();
        setupCopyLinkButton();
        
        // Load comments for this post
        console.log('Calling loadComments function');
        loadComments(postId);
    }// Handle share buttons
    document.querySelectorAll('.share-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.dataset.platform;
            const url = window.location.href;
            const title = document.querySelector('.blog-post-title').textContent;
            
            // Add ripple effect
            addRippleEffect(this, e);

            let shareUrl;switch (platform) {
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                    break;
                case 'whatsapp':
                    shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`;
                    break;
                case 'pinterest':
                    shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`;
                    break;
                case 'email':                case 'gmail':
                    shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent('Bu yazıyı okumanızı öneririm: ' + url)}`;
                    window.location.href = shareUrl;
                    return;
                case 'instagram':
                    // Copy title and URL to clipboard for Instagram
                    copyToClipboard(`${title} ${url}`);
                    createToast('Başlık ve link kopyalandı. Instagram\'da paylaşabilirsiniz.', 'success');                return;
            }

            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
                
                // Show a toast notification
                createToast(`${platform.charAt(0).toUpperCase() + platform.slice(1)} üzerinde paylaşıldı`, 'success');
            }
        });
    });
      // Handle comment form submission
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get the post ID from URL
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('id');
            
            if (!postId) {
                createToast('Blog yazısı kimliği bulunamadı.', 'error');
                return;
            }
            
            // Get form data
            const name = document.getElementById('commentName').value.trim();
            const email = document.getElementById('commentEmail').value.trim();
            const content = document.getElementById('commentText').value.trim();
            
            // Validate inputs
            if (!name || !email || !content) {
                createToast('Lütfen tüm alanları doldurun.', 'warning');
                return;
            }

            // Show loading state
            const submitBtn = commentForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Gönderiliyor...';
            
            // Prepare data for submission
            const commentData = {
                postId: postId,
                name: name,
                email: email,
                content: content
            };
            
            console.log('Submitting comment:', commentData);
            
            // Send data to the server
            fetch('save-comment.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(commentData)
            })            .then(response => response.json())
            .then(data => {
                console.log('Comment submission response:', data);
                
                if (data.success) {
                    // Reset the form
                    commentForm.reset();
                    
                    // Show success message
                    createToast('Yorumunuz başarıyla gönderildi.', 'success');
                    
                    // Add the new comment to the UI
                    const commentsList = document.getElementById('comments');
                    if (commentsList && data.comment) {
                        const commentElement = createCommentElement(data.comment);
                        
                        // If there are no comments yet, clear the "no comments" message
                        const noCommentsMsg = commentsList.querySelector('.no-comments');
                        if (noCommentsMsg) {
                            commentsList.innerHTML = '';
                        }
                        
                        // Add the new comment at the top
                        if (commentsList.firstChild) {
                            commentsList.insertBefore(commentElement, commentsList.firstChild);
                        } else {
                            commentsList.appendChild(commentElement);
                        }
                    }
                } else {
                    createToast('Yorum gönderilirken bir hata oluştu: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error submitting comment:', error);
                createToast('Yorum gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.', 'error');
            })
            .finally(() => {
                // Restore button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            });
        });
    }
});

// Function to load comments for a post
function loadComments(postId) {
    console.log('Loading comments for post ID:', postId);
    const commentsContainer = document.getElementById('comments');
    if (!commentsContainer) {
        console.error('Comments container not found!');
        return;
    }
    
    // Show loading indicator
    commentsContainer.innerHTML = `
        <div class="text-center p-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Yorumlar yükleniyor...</span>
            </div>
            <p class="mt-3">Yorumlar yükleniyor...</p>
        </div>
    `;
    
    // Fetch comments from the server
    fetch(`get-comments.php?postId=${postId}`)
        .then(response => response.json())
        .then(data => {
            console.log('Comments loaded:', data);
            
            if (data.success) {
                if (data.comments && data.comments.length > 0) {
                    // Clear loading indicator
                    commentsContainer.innerHTML = '';
                    
                    // Sort comments by date (newest first)
                    data.comments.sort((a, b) => new Date(b.date) - new Date(a.date));
                    
                    // Add each comment to the UI
                    data.comments.forEach(comment => {
                        const commentElement = createCommentElement(comment);
                        commentsContainer.appendChild(commentElement);
                    });
                } else {
                    // No comments yet
                    commentsContainer.innerHTML = `
                        <div class="alert alert-light text-center no-comments">
                            <p class="mb-0">Henüz yorum yapılmamış. İlk yorumu sen yap!</p>
                        </div>
                    `;
                }
            } else {
                // Error fetching comments
                commentsContainer.innerHTML = `
                    <div class="alert alert-danger">
                        <p class="mb-0">Yorumlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error loading comments:', error);
            commentsContainer.innerHTML = `
                <div class="alert alert-danger">
                    <p class="mb-0">Yorumlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.</p>
                </div>
            `;
        });
}

// Function to create a comment element
function createCommentElement(comment) {
    const commentDate = new Date(comment.date);
    const formattedDate = commentDate.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const commentElement = document.createElement('div');
    commentElement.className = 'comment-item mb-4';
    commentElement.style.opacity = '0';
    commentElement.innerHTML = `
        <div class="card border-0 shadow-sm">
            <div class="card-body">
                <div class="d-flex">
                    <img src="${comment.avatar}" alt="${comment.name}" class="rounded-circle me-3" width="60" height="60">
                    <div>
                        <h5 class="card-title mb-1">${comment.name}</h5>
                        <p class="text-muted small mb-2">${formattedDate}</p>
                        <div class="comment-content">
                            ${comment.content}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Fade in animation
    setTimeout(() => {
        commentElement.style.transition = 'all 0.5s ease';
        commentElement.style.opacity = '1';
    }, 10);
    
    return commentElement;
}

// Set up the scroll progress bar
function setupScrollProgressBar() {
    const progressBar = document.getElementById('readingProgress');
    const positionMarker = document.getElementById('positionMarker');
    
    if (!progressBar && !positionMarker) return;

    window.addEventListener('scroll', function() {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        
        // Update horizontal progress bar
        if (progressBar) {
            progressBar.style.width = scrollPercent + '%';
        }
        
        // Update vertical position marker
        if (positionMarker) {
            positionMarker.style.height = scrollPercent + '%';
        }
        
        // Update reading time modal if it's open
        //updateReadingTimeModal(scrollPercent);
    });
    
    // Add reading time indicator in the navigation
    const readingTimeIndicator = document.querySelector('.reading-time');
    if (readingTimeIndicator) {
        readingTimeIndicator.style.cursor = 'pointer';
        readingTimeIndicator.title = 'Okuma istatistiklerini göster';
        
        readingTimeIndicator.addEventListener('click', function() {
            const modal = new bootstrap.Modal(document.getElementById('readingTimeModal'));
            updateReadingStats();
            modal.show();
        });
    }
}

// Set up the table of contents
function setupTableOfContents() {
    const content = document.querySelector('.blog-post-content');
    const desktopToc = document.getElementById('toc');
    const mobileToc = document.getElementById('mobile-toc');
    
    if (!content || (!desktopToc && !mobileToc)) return;

    // Find all h2 and h3 headings in the content
    const headings = content.querySelectorAll('h2, h3, h4');
    if (headings.length === 0) {
        // Hide TOC containers if no headings
        document.querySelectorAll('.table-of-contents, [data-bs-target="#mobileToc"]').forEach(el => {
            if (el) el.style.display = 'none';
        });
        return;
    }

    // Generate table of contents
    headings.forEach((heading, index) => {
        // Add ID to the heading if it doesn't have one
        if (!heading.id) {
            heading.id = 'heading-' + index;
        }

        // Determine the indentation level based on heading tag
        let indentClass = '';
        if (heading.tagName === 'H3') indentClass = 'ms-3';
        if (heading.tagName === 'H4') indentClass = 'ms-4';

        // Create link for desktop TOC
        if (desktopToc) {
            const desktopLink = document.createElement('a');
            desktopLink.href = '#' + heading.id;
            desktopLink.className = 'toc-link ' + indentClass;
            desktopLink.textContent = heading.textContent;
            desktopLink.dataset.target = heading.id;
            desktopToc.appendChild(desktopLink);
            
            // Add click event
            desktopLink.addEventListener('click', scrollToHeading);
        }
        
        // Create link for mobile TOC
        if (mobileToc) {
            const mobileLink = document.createElement('a');
            mobileLink.href = '#' + heading.id;
            mobileLink.className = 'toc-link ' + indentClass;
            mobileLink.textContent = heading.textContent;
            mobileLink.dataset.target = heading.id;
            mobileToc.appendChild(mobileLink);
            
            // Add click event with additional behavior to close mobile TOC
            mobileLink.addEventListener('click', function(e) {
                scrollToHeading.call(this, e);
                
                // Close the mobile TOC dropdown
                const bsCollapse = bootstrap.Collapse.getInstance(document.getElementById('mobileToc'));
                if (bsCollapse) {
                    bsCollapse.hide();
                }
            });
        }
    });

    // Highlight active TOC item on scroll
    window.addEventListener('scroll', updateActiveTocItem);
    
    // Initial highlight
    setTimeout(updateActiveTocItem, 500);
}

// Function to scroll to heading when TOC link is clicked
function scrollToHeading(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        const headerOffset = 100; // Adjust based on your fixed header height
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Function to update active TOC item based on scroll position
function updateActiveTocItem() {
    const scrollPosition = window.scrollY;
    const headings = document.querySelectorAll('.blog-post-content h2, .blog-post-content h3, .blog-post-content h4');
    
    // Find the current heading
    let currentHeading = null;
    headings.forEach(heading => {
        if (heading.offsetTop - 120 <= scrollPosition) {
            currentHeading = heading;
        }
    });

    // Highlight the corresponding TOC items
    if (currentHeading) {
        document.querySelectorAll('.toc-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.target === currentHeading.id) {
                link.classList.add('active');
            }
        });
    }
}

// Load related posts using improved content similarity algorithm
function loadRelatedPosts(allPosts, currentPost) {
    // Find posts in the same category or with common tags
    const relatedPosts = allPosts
        .filter(post => post.id !== currentPost.id)
        .map(post => {
            // Calculate relevance score based on multiple factors
            let score = 0;
            
            // Category match (higher weight)
            if (post.category === currentPost.category) score += 5;
            
            // Count matching tags
            const commonTags = post.tags ? post.tags.filter(tag => 
                currentPost.tags && currentPost.tags.includes(tag)
            ) : [];
            score += commonTags.length * 3;
            
            // Content similarity based on title and excerpt
            // Title similarity (using basic word matching)
            const titleWords = currentPost.title.toLowerCase().split(/\W+/).filter(w => w.length > 3);
            const postTitleWords = post.title.toLowerCase().split(/\W+/).filter(w => w.length > 3);
            
            const commonTitleWords = titleWords.filter(word => postTitleWords.includes(word));
            score += commonTitleWords.length * 2;
            
            // Excerpt similarity
            if (currentPost.excerpt && post.excerpt) {
                const excerptWords = currentPost.excerpt.toLowerCase().split(/\W+/).filter(w => w.length > 3);
                const postExcerptWords = post.excerpt.toLowerCase().split(/\W+/).filter(w => w.length > 3);
                
                const commonExcerptWords = excerptWords.filter(word => postExcerptWords.includes(word));
                score += commonExcerptWords.length;
            }
            
            // Recency bonus (newer posts get a slight boost)
            const currentPostDate = new Date(currentPost.date);
            const postDate = new Date(post.date);
            const daysDifference = Math.abs((currentPostDate - postDate) / (1000 * 60 * 60 * 24));
            
            // Bonus for posts within 30 days of current post
            if (daysDifference <= 30) {
                score += (30 - daysDifference) / 10; // Max 3 points for very recent posts
            }
            
            return { ...post, relevance: score };
        })
        .filter(post => post.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 3);

    // Display related posts
    const relatedPostsContainer = document.querySelector('.related-posts-list');
    if (relatedPostsContainer) {
        if (relatedPosts.length > 0) {
            relatedPostsContainer.innerHTML = relatedPosts.map(post => `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card related-post-card h-100 border-0 shadow-sm">
                        <img src="${post.image || 'https://via.placeholder.com/300x200?text=PsykoLink'}" 
                             class="card-img-top" alt="${post.title}"
                             style="height: 160px; object-fit: cover;"
                             loading="lazy">
                        <div class="card-body">
                            <div class="small text-muted mb-2">${new Date(post.date).toLocaleDateString('tr-TR')}</div>
                            <h5 class="card-title h6">${post.title}</h5>
                            <p class="card-text small">${post.excerpt ? post.excerpt.substring(0, 80) + '...' : ''}</p>
                        </div>
                        <div class="card-footer bg-transparent border-0 pt-0">
                            <a href="blog-post.html?id=${post.id}" class="btn btn-sm btn-outline-primary">
                                Devamını Oku <i class="fas fa-arrow-right ms-1"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            // If no related posts, hide the section
            document.querySelector('.related-posts').style.display = 'none';
        }
    }
    
    // Load popular posts for sidebar
    loadPopularPosts(allPosts, currentPost.id);
    
    // Load categories for sidebar
    loadCategories(allPosts);
    
    // Load tags for sidebar
    loadTagsCloud(allPosts);
}

// Update meta tags for social sharing
function updateMetaTags(post) {
    const url = window.location.href;
    
    // Update Open Graph meta tags
    document.querySelector('meta[property="og:title"]').setAttribute('content', post.title);
    document.querySelector('meta[property="og:description"]').setAttribute('content', post.excerpt || '');
    document.querySelector('meta[property="og:image"]').setAttribute('content', post.image || '');
    document.querySelector('meta[property="og:url"]').setAttribute('content', url);
    
    // Update Twitter Card meta tags
    document.querySelector('meta[name="twitter:title"]').setAttribute('content', post.title);
    document.querySelector('meta[name="twitter:description"]').setAttribute('content', post.excerpt || '');
    document.querySelector('meta[name="twitter:image"]').setAttribute('content', post.image || '');
    
    // Update description meta tag
    document.querySelector('meta[name="description"]').setAttribute('content', post.excerpt || '');
}

// Load popular posts for sidebar with improved lazy loading
function loadPopularPosts(allPosts, currentPostId) {
    const popularPostsList = document.querySelector('.popular-posts-list');
    if (!popularPostsList) return;
    
    // Sort posts by views or other popularity metric (using date for demo)
    const popularPosts = allPosts
        .filter(post => post.id !== currentPostId) // Exclude current post
        .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date for demo
        .slice(0, 5); // Get top 5
        
    if (popularPosts.length > 0) {
        popularPostsList.innerHTML = popularPosts.map(post => `
            <div class="popular-post mb-3">
                <div class="row g-0">
                    <div class="col-3">
                        <img src="${post.image || 'https://via.placeholder.com/100?text=PsykoLink'}" 
                             class="img-fluid rounded" alt="${post.title}" 
                             style="height: 60px; object-fit: cover;"
                             loading="lazy">
                    </div>
                    <div class="col-9">
                        <div class="ps-3">
                            <h6 class="mb-1 small fw-bold">
                                <a href="blog-post.html?id=${post.id}" class="text-decoration-none">
                                    ${post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title}
                                </a>
                            </h6>
                            <small class="text-muted">${new Date(post.date).toLocaleDateString('tr-TR')}</small>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        const popularPostsWidget = document.querySelector('.popular-posts');
        if (popularPostsWidget) popularPostsWidget.style.display = 'none';
    }
}

// Load categories for sidebar
function loadCategories(allPosts) {
    const categoriesList = document.querySelector('.categories-list');
    if (!categoriesList) return;
    
    // Extract unique categories and count posts in each
    const categories = {};
    allPosts.forEach(post => {
        if (post.category) {
            categories[post.category] = (categories[post.category] || 0) + 1;
        }
    });
    
    if (Object.keys(categories).length > 0) {
        categoriesList.innerHTML = Object.entries(categories)
            .sort((a, b) => b[1] - a[1]) // Sort by post count
            .map(([category, count]) => `
                <li class="mb-2">
                    <a href="blog.html?category=${encodeURIComponent(category.toLowerCase())}" 
                       class="d-flex justify-content-between align-items-center text-decoration-none text-dark">
                        <span>${category}</span>
                        <span class="badge bg-primary rounded-pill">${count}</span>
                    </a>
                </li>
            `).join('');
    } else {
        const categoriesWidget = document.querySelector('.categories-widget');
        if (categoriesWidget) categoriesWidget.style.display = 'none';
    }
}

// Load tags cloud for sidebar
function loadTagsCloud(allPosts) {
    const tagsCloud = document.querySelector('.tags-cloud');
    if (!tagsCloud) return;
    
    // Extract unique tags and count occurrences
    const tags = {};
    allPosts.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach(tag => {
                tags[tag] = (tags[tag] || 0) + 1;
            });
        }
    });
    
    if (Object.keys(tags).length > 0) {
        tagsCloud.innerHTML = Object.entries(tags)
            .sort((a, b) => b[1] - a[1]) // Sort by tag count
            .slice(0, 15) // Limit to top 15 tags
            .map(([tag, count]) => `
                <a href="blog.html?tag=${encodeURIComponent(tag.toLowerCase())}" 
                   class="badge bg-light text-dark py-2 px-3 me-2 mb-2 text-decoration-none"
                   style="font-size: ${Math.max(0.8, Math.min(1.3, 0.8 + count * 0.1))}rem">
                    ${tag}
                </a>
            `).join('');
    } else {
        const tagsWidget = document.querySelector('.tags-widget');
        if (tagsWidget) tagsWidget.style.display = 'none';
    }
}

// Create reading milestones
function createReadingMilestones(post) {
    const content = document.querySelector('.blog-post-content');
    if (!content) return;
    
    // Get content paragraphs
    const paragraphs = content.querySelectorAll('p, h2, h3, h4, ul, ol, blockquote');
    if (paragraphs.length < 4) return; // Not enough content for milestones
    
    // Insert milestone indicators at approximately 25%, 50%, and 75% of the content
    const milestones = [
        Math.floor(paragraphs.length * 0.25),
        Math.floor(paragraphs.length * 0.5),
        Math.floor(paragraphs.length * 0.75)
    ];
    
    // Calculate estimated total reading time based on content type
    let wordCount = 0;
    
    if (typeof post.content === 'string') {
        // Handle string content
        wordCount = post.content.split(/\s+/).length;
    } else if (post.content && typeof post.content === 'object') {
        // Handle object-based content
        if (post.content.mainText) {
            wordCount += post.content.mainText.split(/\s+/).length;
        }
        
        if (post.content.details && Array.isArray(post.content.details)) {
            post.content.details.forEach(detail => {
                if (detail.content && typeof detail.content === 'string') {
                    wordCount += detail.content.split(/\s+/).length;
                }
                if (detail.title) {
                    wordCount += detail.title.split(/\s+/).length;
                }
            });
        }
    } else if (post.readingTime) {
        // If post has predefined reading time, use that for calculation
        return Math.max(1, post.readingTime) * 200;
    }
    
    const totalReadingTime = Math.max(1, Math.ceil(wordCount / 200));
    
    milestones.forEach((milestone, index) => {
        if (milestone > 0 && milestone < paragraphs.length) {
            const milestoneEl = document.createElement('div');
            milestoneEl.className = 'reading-milestone';
            milestoneEl.innerHTML = `
                <div class="progress mt-4 mb-4">
                    <div class="progress-bar" role="progressbar" 
                         style="width: ${(index + 1) * 25}%" 
                         aria-valuenow="${(index + 1) * 25}" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                        ${(index + 1) * 25}%
                    </div>
                </div>
                <p class="text-center text-muted small">
                    <i class="far fa-clock me-1"></i> 
                    Yaklaşık ${Math.ceil(totalReadingTime * (index + 1) / 4)} dakika okudunuz, 
                    ${Math.ceil(totalReadingTime * (4 - (index + 1)) / 4)} dakika kaldı
                </p>
            `;
            
            paragraphs[milestone].parentNode.insertBefore(milestoneEl, paragraphs[milestone]);
        }
    });
}

// Toast notification function
function createToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => {
        toast.remove();
    });
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    
    // Set icon based on toast type
    let iconClass = 'info-circle';
    switch(type) {
        case 'success':
            iconClass = 'check-circle';
            break;
        case 'error':
            iconClass = 'exclamation-circle';
            break;
        case 'warning':
            iconClass = 'exclamation-triangle';
            break;
    }
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${iconClass}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="Kapat">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Add close button event listener
    const closeButton = toast.querySelector('.toast-close');
    closeButton.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
    
    // Show toast with slight delay to allow CSS transition
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto close after 4 seconds
    setTimeout(() => {
        if (document.body.contains(toast)) {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    toast.remove();
                }
            }, 300);
        }
    }, 4000);
}

function loadBlogPost(postId) {
    // Show loading state
    const contentWrapper = document.querySelector('.content-wrapper');
    if (contentWrapper) {
        contentWrapper.innerHTML = `
            <div class="text-center p-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Yazı yükleniyor...</p>
            </div>
        `;
    } else {
        console.error('Content wrapper element not found.');
        return;
    }

    // Update canonical link
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
        canonicalLink.setAttribute('href', `${window.location.origin}/blog-post.html?id=${postId}`);
    }

    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log('data.json fetched successfully');
            return response.json();
        })
        .then(data => {
            console.log('data.json parsed successfully', data);
            console.log('Looking for post with ID:', postId);
            const post = data.blogPosts?.find(p => p.id === postId);
            console.log('Found post:', post);
            if (post) {
                displayBlogPost(post);
                loadRelatedPosts(data.blogPosts || [], post);
                updateMetaTags(post);

                // Track post view (in a real application, this would send to server)
                console.log('Post viewed:', postId);

                // If URL has a hash, scroll to that element after content is loaded
                setTimeout(() => {
                    if (window.location.hash) {
                        const targetElement = document.querySelector(window.location.hash);
                        if (targetElement) {
                            window.scrollTo({
                                top: targetElement.offsetTop - 100,
                                behavior: 'smooth'
                            });
                        }
                    }
                }, 500);
            } else {
                console.warn('Post not found. Displaying fallback message.');
                contentWrapper.innerHTML = `
                    <div class="alert alert-warning" role="alert">
                        <h4 class="alert-heading">Yazı Bulunamadı</h4>
                        <p>Aradığınız yazı bulunamadı veya kaldırılmış olabilir.</p>
                        <hr>
                        <p class="mb-0">Lütfen <a href="blog.html" class="alert-link">blog sayfamıza</a> geri dönün ve diğer yazılarımıza göz atın.</p>
                    </div>
                `;
            }        })
        .catch(error => {
            console.error('Error loading blog post:', error);
            const contentWrapper = document.querySelector('.content-wrapper');
            if (contentWrapper) {
                contentWrapper.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <h4 class="alert-heading">Hata Oluştu</h4>
                        <p>Blog yazısı yüklenirken bir hata oluştu: ${error.message}</p>
                        <hr>
                        <p class="mb-0">Lütfen daha sonra tekrar deneyin veya <a href="blog.html" class="alert-link">blog sayfamıza</a> geri dönün.</p>
                    </div>
                `;
            }
        });
}

function displayBlogPost(post) {
    document.title = `${post.title} - PsykoLink Blog`;
    
    // Update header content
    const titleElements = document.querySelectorAll('.blog-post-title');
    titleElements.forEach(el => el.textContent = post.title);
    
    // Update date
    const dateElements = document.querySelectorAll('.post-date');
    const formattedDate = new Date(post.date).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    dateElements.forEach(el => el.textContent = formattedDate);
    
    // Update category
    const categoryElements = document.querySelectorAll('.post-category');
    categoryElements.forEach(el => {
        el.textContent = post.category || 'Genel';
        if (el.tagName === 'A') {
            el.href = `blog.html?category=${encodeURIComponent((post.category || 'Genel').toLowerCase())}`;
        }
    });
    
    // Update author
    const authorElements = document.querySelectorAll('.post-author');
    authorElements.forEach(el => el.textContent = post.author || 'PsykoLink');
    
    // Update author details in author bio section
    const authorNameElement = document.querySelector('.author-name');
    if (authorNameElement) {
        authorNameElement.textContent = post.author || 'PsykoLink';
    }
    
    const authorBioElement = document.querySelector('.author-bio');
    if (authorBioElement) {
        authorBioElement.textContent = post.authorBio || 'PsykoLink yazarı';
    }
    
    const authorImageElement = document.querySelector('.author-image');
    if (authorImageElement) {
        authorImageElement.src = post.authorImage || 'images/default-author.jpg';
    }    // Update content
    const contentWrapper = document.querySelector('.content-wrapper');
    if (contentWrapper) {
        try {
            // Remove any existing loading spinner
            const loadingSpinner = document.querySelector('.blog-post-content .text-center.p-5');
            if (loadingSpinner) {
                loadingSpinner.remove();
            }
            
            // Display the content based on type
            if (typeof post.content === 'string') {
                contentWrapper.innerHTML = post.content;
            } else if (post.content && typeof post.content === 'object') {
                // Handle object-based content (like from our JSON structure)
                if (post.content.mainText) {
                    let htmlContent = `<div class="main-content mb-4"><p>${post.content.mainText}</p></div>`;
                    
                    // Add details if available
                    if (post.content.details && Array.isArray(post.content.details)) {
                        htmlContent += '<div class="content-details">';
                        post.content.details.forEach(detail => {
                            htmlContent += `
                                <div class="content-detail mb-4">
                                    <h3>${detail.title}</h3>
                                    <div>${detail.content}</div>
                                </div>
                            `;
                        });
                        htmlContent += '</div>';
                    }
                    
                    contentWrapper.innerHTML = htmlContent;
                } else {
                    // Fallback for other object structures
                    contentWrapper.innerHTML = '<div class="alert alert-info">Bu içerik alternatif bir formatta sunuluyor.</div>';
                    contentWrapper.innerHTML += JSON.stringify(post.content, null, 2);
                }
            } else {
                // Fallback for no content
                contentWrapper.innerHTML = '<div class="alert alert-warning">Bu yazı için içerik bulunamadı.</div>';
            }
            
            console.log('Blog post content displayed successfully');
        } catch (error) {
            console.error('Error displaying blog post content:', error);
            contentWrapper.innerHTML = `
                <div class="alert alert-danger">
                    <h4 class="alert-heading">İçerik Yüklenemedi</h4>
                    <p>Blog yazısı görüntülenirken bir hata oluştu.</p>
                </div>
            `;
        }
    } else {
        console.error('Content wrapper element not found.');
    }
    
    // Update tags
    const tagsContainer = document.querySelector('.blog-post-tags');
    if (tagsContainer && post.tags && post.tags.length > 0) {
        const tagsHtml = post.tags.map(tag => 
            `<a href="blog.html?tag=${encodeURIComponent(tag.toLowerCase())}" class="badge bg-light text-dark me-2 py-2 px-3">${tag}</a>`
        ).join('');
        tagsContainer.innerHTML = `<i class="fas fa-tags me-2" aria-hidden="true"></i> ${tagsHtml}`;
    } else if (tagsContainer) {
        tagsContainer.style.display = 'none';
    }
    
    // Create estimated reading progress time indicators at 25%, 50%, 75% points in the article
    createReadingMilestones(post);
    
    // Update reading stats
    updateReadingStats();
    const spinner = document.querySelector('.text-center.p-5');
if (spinner) {
    spinner.style.display = 'none'; // ✅ Loading spinnerı gizle
    spinner.remove(); // ✅ Yükleme spinnerını DOM'dan kaldır
    console.log('Loading spinner removed successfully');
}
}

// Set up dark mode toggle
function setupDarkModeToggle() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // Check for saved theme preference
    const currentTheme = localStorage.getItem('theme');
    
    // If the user has explicitly chosen a theme, use it
    if (currentTheme) {
        document.body.classList.toggle('dark-mode', currentTheme === 'dark');
        updateDarkModeToggleText(currentTheme === 'dark');
    } 
    // Otherwise, use light mode as default
    else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
        updateDarkModeToggleText(false);
    }
    
    // Add toggle event listener
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            const isDarkMode = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            updateDarkModeToggleText(isDarkMode);
        });    }
}

// Update the dark mode toggle button text
function updateDarkModeToggleText(isDarkMode) {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.innerHTML = isDarkMode 
            ? '<i class="fas fa-sun me-2"></i> Aydınlık Mod' 
            : '<i class="fas fa-moon me-2"></i> Karanlık Mod';
    }
}

// Setup font size control
function setupFontSizeControl() {
    const fontSizeRange = document.getElementById('fontSizeRange');
    const content = document.querySelector('.blog-post-content');
    
    if (fontSizeRange && content) {
        // Set initial value based on stored preference
        const savedFontSize = localStorage.getItem('fontSize');
        if (savedFontSize) {
            fontSizeRange.value = savedFontSize;
            updateFontSize(savedFontSize);
        }
        
        fontSizeRange.addEventListener('input', function() {
            const fontSize = this.value;
            updateFontSize(fontSize);
            localStorage.setItem('fontSize', fontSize);
        });
    }
}

// Update font size based on range input
function updateFontSize(sizePercent) {
    const content = document.querySelector('.blog-post-content');
    if (content) {
        content.style.fontSize = `${sizePercent / 100 * 1.1}rem`;
    }
}

// Setup print button
function setupPrintButton() {
    const printButton = document.getElementById('printButton');
    if (printButton) {
        printButton.addEventListener('click', function() {
            window.print();
        });
    }
}

// Setup copy link button
function setupCopyLinkButton() {
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', function() {
            const currentUrl = window.location.href;
            
            // Create a temporary input element
            const tempInput = document.createElement('input');
            tempInput.value = currentUrl;
            document.body.appendChild(tempInput);
            
            // Select and copy the text
            tempInput.select();
            document.execCommand('copy');
            
            // Remove the temporary element
            document.body.removeChild(tempInput);
            
            // Show success message
            createToast('Bağlantı panoya kopyalandı', 'success');
        });
    }
}

// Panoya kopyalama işlevi (Instagram paylaşımı için)
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            createToast('Link kopyalandı! Instagram\'da paylaşabilirsiniz.', 'success');
        })
        .catch(err => {
            console.error('Kopyalama hatası:', err);
            createToast('Link kopyalanamadı. Lütfen manuel olarak kopyalayın.', 'error');
        });
}

// Update reading time modal stats
function updateReadingTimeModal(scrollPercent) {
    const modal = document.getElementById('readingTimeModal');
    if (modal && modal.classList.contains('show')) {
        const progressBar = modal.querySelector('.reading-progress-bar');
        const progressPercent = modal.querySelector('.reading-progress-percent');
        
        if (progressBar && progressPercent) {
            progressBar.style.width = scrollPercent + '%';
            progressBar.setAttribute('aria-valuenow', Math.round(scrollPercent));
            progressPercent.textContent = Math.round(scrollPercent) + '%';
        }
    }
}

// Update reading stats in the modal
function updateReadingStats() {
    const content = document.querySelector('.blog-post-content');
    if (!content) return;
    
    // Get content statistics
    const wordCount = content.textContent.split(/\s+/).length;
    const paragraphCount = content.querySelectorAll('p').length;
    const headingCount = content.querySelectorAll('h2, h3, h4, h5, h6').length;
    const imageCount = content.querySelectorAll('img').length;
    
    // Calculate reading time (200 words per minute)
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    
    // Update stats in modal
    const modal = document.getElementById('readingTimeModal');
    if (modal) {
        modal.querySelector('.word-count').textContent = wordCount;
        modal.querySelector('.paragraph-count').textContent = paragraphCount;
        modal.querySelector('.heading-count').textContent = headingCount;
        modal.querySelector('.image-count').textContent = imageCount;
        modal.querySelector('.reading-time-estimate').textContent = 
            `${readingTime} dakika`;
    }
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
