new Vue({
    el: '.container',
    data: {
        isCollapsed: true,
        isMobile: window.innerWidth <= 768
    },
    mounted() {
        // 화면 크기 변화 감지
        window.addEventListener('resize', this.checkScreenSize);
        
        // 토글 버튼 이벤트 리스너
        const toggleButton = document.getElementById('sidebar-toggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', this.toggleSidebarMobile);
        }
    },
    methods: {
        checkScreenSize() {
            this.isMobile = window.innerWidth <= 768;
        },
        toggleSidebar() {
            if (!this.isMobile) {
                this.isCollapsed = !this.isCollapsed;
            }
        },
        toggleSidebarMobile() {
            this.isCollapsed = !this.isCollapsed;
            const toggleButton = document.getElementById('sidebar-toggle');
            if (toggleButton) {
                toggleButton.classList.toggle('active', !this.isCollapsed);
            }
        },
        scrollToSection(sectionId) {
            // 기본 동작 방지
            event.preventDefault();
            
            // 해당 섹션으로 부드럽게 스크롤
            const element = document.getElementById(sectionId);
            if (element) {
                // 사이드바 너비와 헤더 높이 등을 고려한 위치 계산
                const headerOffset = 70; // 상단 여백 조정
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                // 부드러운 스크롤 효과
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
                
                // 모바일에서는 메뉴 닫기
                if (this.isMobile) {
                    this.isCollapsed = true;
                    const toggleButton = document.getElementById('sidebar-toggle');
                    if (toggleButton) {
                        toggleButton.classList.remove('active');
                    }
                }
            }
        }
    }
});



// head 태그 안에 script 태그로 추가하거나, 기존 JS 파일에 추가
document.addEventListener('DOMContentLoaded', function() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const progressBar = document.querySelector('.progress-bar');
    const loadingText = document.querySelector('.loading-content p');
    let loadedItems = 0;
    let totalItems = 0;
    
    // 모든 이미지 찾기
    const images = document.querySelectorAll('img');
    // 배경 이미지도 포함 (header-bg만 포함)
    const bgElements = document.querySelectorAll('.header-bg');
    
    totalItems = images.length + bgElements.length;
    
    // 배경 이미지 로딩
    bgElements.forEach(el => {
        const url = getComputedStyle(el).backgroundImage.match(/url\(["']?([^"']*)["']?\)/)[1];
        if (url) {
            const img = new Image();
            img.onload = imageLoaded;
            img.onerror = imageLoaded; // 오류 발생해도 계속 진행
            img.src = url;
        } else {
            // 배경 이미지 URL을 추출할 수 없는 경우
            imageLoaded();
        }
    });
    
    // 일반 이미지 로딩 이벤트 추가
    images.forEach(img => {
        if (img.complete) {
            imageLoaded();
        } else {
            img.addEventListener('load', imageLoaded);
            img.addEventListener('error', imageLoaded); // 오류 발생해도 계속 진행
        }
    });
    
    // 모든 항목이 로드되었다면
    if (totalItems === 0) {
        completeLoading();
    }
    
    // 이미지 로드 완료 처리
    function imageLoaded() {
        loadedItems++;
        const progress = Math.round((loadedItems / totalItems) * 100);
        progressBar.style.width = progress + '%';
        loadingText.textContent = `Loading resources... ${progress}%`;
        
        if (loadedItems >= totalItems) {
            completeLoading();
        }
    }
    
    // 로딩 완료
    function completeLoading() {
        loadingText.textContent = 'Ready!';
        progressBar.style.width = '100%';
        
        // 약간의 지연 후 페이지 표시
        setTimeout(() => {
            loadingOverlay.style.opacity = 0;
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }, 500);
    }
    
    // 일정 시간이 지나도 로드되지 않으면 강제로 표시
    setTimeout(() => {
        if (loadingOverlay.style.display !== 'none') {
            completeLoading();
        }
    }, 8000); // 8초 후 타임아웃
});