// Emoiro - Client-side JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Add smooth transitions to all interactive elements
    addInteractiveEffects();
    
    // Initialize page-specific functionality
    const currentPage = getCurrentPage();
    
    switch(currentPage) {
        case 'index':
            initHomePage();
            break;
        case 'record':
            initRecordPage();
            break;
        case 'history':
            initHistoryPage();
            break;
    }
    
    // Add global event listeners
    addGlobalEventListeners();
}

function getCurrentPage() {
    const path = window.location.pathname;
    if (path === '/' || path === '/index') return 'index';
    if (path === '/record') return 'record';
    if (path === '/history') return 'history';
    return 'unknown';
}

function addInteractiveEffects() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', createRippleEffect);
    });
    
    // Add hover effects to cards
    const cards = document.querySelectorAll('.entry-card, .timeline-item, .stats-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

function createRippleEffect(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function initHomePage() {
    // Animate recent entries on load
    const entryCards = document.querySelectorAll('.entry-card');
    entryCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Add click animations to palette items
    const paletteItems = document.querySelectorAll('.palette-item');
    paletteItems.forEach(item => {
        item.addEventListener('click', function() {
            this.style.animation = 'pulse 0.6s ease-in-out';
            setTimeout(() => {
                this.style.animation = '';
            }, 600);
        });
    });
    
    // Show motivational messages
    showRandomMotivation();
}

function initRecordPage() {
    const form = document.querySelector('.record-form');
    const emotionOptions = document.querySelectorAll('.emotion-option');
    const textarea = document.querySelector('#note');
    
    if (!form) return;
    
    // Emotion selection interaction
    emotionOptions.forEach(option => {
        const input = option.querySelector('input[type="radio"]');
        const label = option.querySelector('.emotion-label');
        
        input.addEventListener('change', function() {
            updateEmotionSelection();
            showEmotionFeedback(this.value);
        });
        
        // Add keyboard navigation
        label.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                input.checked = true;
                updateEmotionSelection();
            }
        });
    });
    
    // Auto-resize textarea
    if (textarea) {
        textarea.addEventListener('input', autoResizeTextarea);
        textarea.addEventListener('focus', function() {
            this.style.minHeight = '120px';
        });
    }
    
    // Form submission handling
    form.addEventListener('submit', function(e) {
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '記録中... ✨';
            submitBtn.disabled = true;
            
            // Add loading animation
            submitBtn.style.background = 'linear-gradient(135deg, #6C63FF, #8B5FBF)';
            submitBtn.style.animation = 'pulse 1s infinite';
        }
    });
    
    // Initialize emotion selection state
    updateEmotionSelection();
}

function updateEmotionSelection() {
    const emotionOptions = document.querySelectorAll('.emotion-option');
    emotionOptions.forEach(option => {
        const input = option.querySelector('input[type="radio"]');
        const label = option.querySelector('.emotion-label');
        
        if (input.checked) {
            option.classList.add('selected');
            label.style.transform = 'scale(1.1)';
            label.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
        } else {
            option.classList.remove('selected');
            label.style.transform = 'scale(1)';
            label.style.boxShadow = 'none';
        }
    });
}

function showEmotionFeedback(emotionType) {
    // Define feedback messages for each emotion
    const feedbackMessages = {
        'joy': ['素晴らしい一日ですね！ ✨', 'その笑顔を大切に 😊'],
        'anger': ['感情を記録することで心が軽くなります', '深呼吸をして、穏やかな気持ちを取り戻しましょう'],
        'sadness': ['辛い時もありますが、明日はきっと良い日になります', 'あなたの感情は大切です'],
        'calm': ['穏やかな心、とても素敵です', '平和な時間を大切にしてください'],
        'excitement': ['その興奮を記録に残しましょう！', 'エネルギーに満ちた一日ですね'],
        'anxiety': ['不安な気持ちも大切な感情です', 'ゆっくり深呼吸をしてみてください'],
        'love': ['愛に満ちた心、美しいですね ❤️', 'その温かい気持ちを大切に']
    };
    
    const messages = feedbackMessages[emotionType] || ['素敵な感情を記録していただき、ありがとうございます'];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    showToast(message, 'success');
}

function autoResizeTextarea() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
}

function initHistoryPage() {
    // This function is enhanced in the history.html template
    // with more specific JavaScript for charts and calendar
    
    // Add smooth scrolling to timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }
            });
        },
        { threshold: 0.1 }
    );
    
    timelineItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'all 0.6s ease-out';
        observer.observe(item);
    });
}

function addGlobalEventListeners() {
    // Add confirmation dialogs for delete actions
    const deleteLinks = document.querySelectorAll('a[href*="/delete/"]');
    deleteLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!confirm('この記録を削除しますか？')) {
                e.preventDefault();
            }
        });
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + N for new record
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            window.location.href = '/record';
        }
        
        // Ctrl/Cmd + H for history
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            window.location.href = '/history';
        }
        
        // Escape to go home
        if (e.key === 'Escape') {
            window.location.href = '/';
        }
    });
}

function showRandomMotivation() {
    const motivationalMessages = [
        '今日も一日お疲れ様でした ✨',
        '感情を記録することで、心の健康を保てます',
        '小さな変化も大切な成長です',
        'あなたの感情は美しい色彩を描いています',
        '毎日の記録が未来のあなたを支えます'
    ];
    
    const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    
    // Show as a subtle notification after a delay
    setTimeout(() => {
        showToast(message, 'info', 5000);
    }, 3000);
}

function showToast(message, type = 'info', duration = 3000) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Style the toast
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? '#4ECDC4' : type === 'error' ? '#EF5350' : '#6C63FF',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        zIndex: '1000',
        transform: 'translateX(400px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        maxWidth: '300px',
        fontSize: '0.9rem',
        lineHeight: '1.4'
    });
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, duration);
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
}

function getEmotionColor(emotionType) {
    const emotionColors = {
        'joy': '#FFD700',
        'anger': '#FF4444',
        'sadness': '#4A90E2',
        'calm': '#90EE90',
        'excitement': '#FF6B35',
        'anxiety': '#9B59B6',
        'love': '#FF1744'
    };
    
    return emotionColors[emotionType] || '#6C63FF';
}

// Add CSS for ripple effect and toasts
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .toast {
        cursor: pointer;
    }
    
    .toast:hover {
        transform: translateX(-5px) !important;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2) !important;
    }
    
    @media (max-width: 768px) {
        .toast {
            right: 10px;
            left: 10px;
            max-width: none;
            transform: translateY(-100px);
        }
        
        .toast.show {
            transform: translateY(0) !important;
        }
    }
`;

document.head.appendChild(style);