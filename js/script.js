new Vue({
    el: '.container',
    data: {
        isCollapsed: true,
        isMobile: window.innerWidth <= 768
    },
    mounted() {
        // 화면 크기 변화 감지
        window.addEventListener('resize', this.checkScreenSize);
        this.checkScreenSize();
        
        // 토글 버튼에 이벤트 연결
        const toggleButton = document.getElementById('sidebar-toggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', this.toggleSidebar);
        }
        
        // project-card에 클릭 이벤트 추가
        this.addClickToProjectCards();
        
        // 뒤로가기로 돌아왔을 때 스크롤 위치 복원
        if (performance.navigation.type === 2 || window.history.state?.scrollPos) {
            const scrollPos = window.history.state?.scrollPos || 0;
            setTimeout(() => {
                window.scrollTo(0, scrollPos);
            }, 200);
        }
    },
    methods: {
        checkScreenSize() {
            this.isMobile = window.innerWidth <= 768;
        },
        toggleSidebar() {
            this.isCollapsed = !this.isCollapsed;
            const toggleButton = document.getElementById('sidebar-toggle');
            if (toggleButton) {
                toggleButton.classList.toggle('active', !this.isCollapsed);
            }
        },
        scrollToSection(sectionId) {
            event.preventDefault();
            const element = document.getElementById(sectionId);
            if (element) {
                const headerOffset = 70;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
                
                // 모바일에서는 메뉴 클릭 후 사이드바 닫기
                if (this.isMobile) {
                    this.isCollapsed = true;
                    const toggleButton = document.getElementById('sidebar-toggle');
                    if (toggleButton) {
                        toggleButton.classList.remove('active');
                    }
                }
            }
        },

        // 새로운 메서드: project-card에 클릭 이벤트 추가
        addClickToProjectCards() {
            const projectCards = document.querySelectorAll('.project-card');
            
            projectCards.forEach(card => {
                card.addEventListener('click', function(e) {
                    // 이미 링크를 클릭한 경우는 제외 (중복 이벤트 방지)
                    if (e.target.closest('a.project-link') || e.target.tagName === 'A') {
                        return;
                    }
                    
                    // 카드 내의 project-link 찾기
                    const projectLink = card.querySelector('a.project-link');
                    
                    // 링크가 있으면 해당 링크로 이동
                    if (projectLink) {
                        // 현재 스크롤 위치를 history state에 저장
                        const scrollPosition = window.pageYOffset;
                        history.replaceState({ scrollPos: scrollPosition }, document.title);
                        
                        // 새 페이지로 이동
                        window.location.href = projectLink.href;
                    }
                });
                
                // 링크가 있는 카드에만 포인터 커서와 시각적 힌트 추가
                const hasLink = card.querySelector('a.project-link');
                if (hasLink) {
                    card.style.cursor = 'pointer';
                    card.classList.add('has-link');
                }
            });
        }
    }
});


// header용 Vue 인스턴스 추가
document.addEventListener('DOMContentLoaded', function() {
    // project-header가 존재할 때만 Vue 인스턴스 생성
    if (document.querySelector('.project-header')) {
        new Vue({
            el: '.project-header'
        });
    }
    
    // 기존 container Vue 인스턴스는 유지
    // ...
});

// returnToSavedPosition 함수를 History API 방식으로 변경
function handleBackNavigation(e) {
    e.preventDefault();
    // 현재 스크롤 위치를 history state에 저장
    const currentScrollPos = window.pageYOffset;
    history.replaceState({ scrollPos: currentScrollPos }, document.title);
    
    // 뒤로가기 실행
    history.back();
}

// 단일 DOMContentLoaded 이벤트 핸들러
document.addEventListener('DOMContentLoaded', function() {
    // URL에서 스크롤 파라미터 확인 제거 (History API로 대체)
    
    // 페이지 이동 전에 현재 스크롤 위치 저장
    window.addEventListener('beforeunload', function() {
        if (!window.history.state) {
            const scrollPos = window.pageYOffset;
            history.replaceState({ scrollPos: scrollPos }, document.title);
        }
    });

    const loadingOverlay = document.getElementById('loading-overlay');
    const progressBar = document.querySelector('.progress-bar');
    const loadingText = document.querySelector('.loading-content p');
    let loadedItems = 0;
    let totalItems = 0;
    let hasScrollTarget = false;
    let targetPosition = 0;
    let scrollCompleted = false;
    
    // URL에서 스크롤 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('scroll')) {
        hasScrollTarget = true;
        targetPosition = parseInt(urlParams.get('scroll'));
        // URL에서 파라미터 제거
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // 모든 이미지 찾기
    const images = document.querySelectorAll('img');
    // 배경 이미지도 포함 (header-bg만 포함)
    const bgElements = document.querySelectorAll('.header-bg');
    
    // 총 로딩 항목 = 이미지 + 배경이미지 + 스크롤 작업(있는 경우 1 추가)
    totalItems = images.length + bgElements.length + (hasScrollTarget ? 1 : 0);
    
    // 배경 이미지 로딩
    bgElements.forEach(el => {
        const url = getComputedStyle(el).backgroundImage.match(/url\(["']?([^"']*)["']?\)/)[1];
        if (url) {
            const img = new Image();
            img.onload = imageLoaded;
            img.onerror = imageLoaded;
            img.src = url;
        } else {
            imageLoaded();
        }
    });
    
    // 일반 이미지 로딩 이벤트 추가
    images.forEach(img => {
        if (img.complete) {
            imageLoaded();
        } else {
            img.addEventListener('load', imageLoaded);
            img.addEventListener('error', imageLoaded);
        }
    });
    
    // 모든 항목이 로드되었다면
    if (totalItems === 0) {
        completeLoading();
    }
    
    // 이미지 로드 완료 처리
    function imageLoaded() {
        loadedItems++;
        updateProgress();
        
        // 이미지가 모두 로드되고 스크롤 대상이 있으면 스크롤 작업 수행
        if (loadedItems === images.length + bgElements.length && hasScrollTarget && !scrollCompleted) {
            performScroll();
        }
    }
    
    // 스크롤 작업 수행
    function performScroll() {
        // 스크롤 실행 전 상태 표시
        loadingText.textContent = `Positioning content...`;
        
        // 즉시 스크롤 실행 (사용자에게 보이지 않음)
        window.scrollTo({
            top: targetPosition,
            behavior: "auto"
        });
        
        // 스크롤이 완전히 적용되도록 짧은 지연 후 처리 완료
        setTimeout(() => {
            scrollCompleted = true;
            loadedItems++;
            updateProgress();
        }, 300); // 스크롤 완료를 확인하기 위한 지연
    }
    
    // 진행률 업데이트
    function updateProgress() {
        const progress = Math.round((loadedItems / totalItems) * 100);
        progressBar.style.width = progress + '%';
        
        // 스크롤 작업 포함 모든 작업 완료 시
        if (progress < 100) {
            if (!hasScrollTarget || (hasScrollTarget && !scrollCompleted)) {
                loadingText.textContent = `Loading resources... ${progress}%`;
            }
        } else {
            loadingText.textContent = 'Ready!';
            completeLoading();
        }
    }
    
    // 로딩 완료
    function completeLoading() {
        // 스크롤 작업이 필요하지만 아직 완료되지 않았으면 기다림
        if (hasScrollTarget && !scrollCompleted) {
            return;
        }
        
        // 진행률이 100%가 아니면 100%로 설정
        progressBar.style.width = '100%';
        loadingText.textContent = 'Ready!';
        
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
            // 스크롤 작업이 있지만 아직 완료되지 않았다면 수행
            if (hasScrollTarget && !scrollCompleted) {
                performScroll();
                // 추가 지연 후 강제 완료
                setTimeout(() => {
                    scrollCompleted = true;
                    loadedItems = totalItems; // 모든 항목이 로드된 것으로 처리
                    updateProgress();
                }, 300);
            } else {
                // 스크롤 작업이 없거나 이미 완료된 경우
                loadedItems = totalItems; // 모든 항목이 로드된 것으로 처리
                updateProgress();
            }
        }
    }, 8000);
    
    // 토글 버튼 이벤트 리스너 추가
    // const toggleButton = document.getElementById('sidebar-toggle');
    // if (toggleButton) {
    //     toggleButton.addEventListener('click', function() {
    //         const sidebar = document.getElementById('sidebar');
    //         sidebar.classList.toggle('expanded');
    //         this.classList.toggle('active');
    //     });
    // }
});

// 페이지 로드 시 저장된 스크롤 위치 복원
window.addEventListener('load', function() {
    // popstate 이벤트는 뒤로가기/앞으로가기 버튼 클릭 시 발생
    window.addEventListener('popstate', function(e) {
        if (e.state && e.state.scrollPos) {
            // 약간의 지연 후 스크롤 위치 복원 (DOM이 완전히 로드된 후)
            setTimeout(() => {
                window.scrollTo(0, e.state.scrollPos);
            }, 200);
        }
    });
    
    // 페이지 첫 로드 시 현재 스크롤 위치(0,0)를 history state에 저장
    if (!history.state) {
        history.replaceState({ scrollPos: 0 }, document.title);
    }
});