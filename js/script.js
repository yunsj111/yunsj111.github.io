new Vue({
    el: '.container',
    data: {
        isCollapsed: true,
        message: 'Hello, Vue.js!'
    },
    methods: {
        toggleSidebar() {
            this.isCollapsed = !this.isCollapsed;
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
                
                // 모바일에서는 메뉴 접기
                if (window.innerWidth <= 768) {
                    this.isCollapsed = true;
                }
            }
        }
    }
});