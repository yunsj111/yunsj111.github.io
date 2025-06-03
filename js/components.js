// 경력 카드 컴포넌트
Vue.component('education-card', {
    props: {
        title: {
            type: String,
            required: true
        },
        institution: {
            type: String,
            required: true
        },
        period: {
            type: String,
            required: true
        },
        thesis: {
            type: String,
            default: ''
        },
        projects: {
            type: Array,
            default: function() { return []; }
        }
    },
    template: `
        <div class="education-card">
            <h3>{{ title }}</h3>
            <span class="period">{{ institution }} ({{ period }})</span>
            <p class="thesis" v-if="thesis">Thesis: {{ thesis }}</p>
            <template v-if="projects && projects.length > 0">
                <h4 class="project">Projects:</h4>
                <ul>
                    <li v-for="project in projects">{{ project }}</li>
                </ul>
            </template>
            <slot></slot>
        </div>
    `
});


// 프로젝트 카드 컴포넌트
Vue.component('project-card', {
    props: {
        title: String,
        description: String,
        imgSrc: String,
        imgAlt: String,
        linkUrl: String,
        hasLink: {
            type: Boolean,
            default: false
        }
    },
    template: `
        <div class="project-card" :class="{ 'has-link': hasLink }">
            <template v-if="hasLink">
                <a :href="linkUrl" class="project-link" @click="handleLinkClick">
                    <div class="project-image" v-if="imgSrc">
                        <img :src="imgSrc" :alt="imgAlt">
                    </div>
                    <h3>{{ title }}</h3>
                    <p>{{ description }}</p>
                </a>
            </template>
            <template v-else>
                <div class="project-image" v-if="imgSrc">
                    <img :src="imgSrc" :alt="imgAlt">
                </div>
                <h3>{{ title }}</h3>
                <p>{{ description }}</p>
            </template>
        </div>
    `,
    mounted() {
        if (this.hasLink) {
            this.$el.addEventListener('click', this.handleClick);
        }
    },
    methods: {
        handleClick(e) {
            // 이미 링크를 클릭한 경우는 제외
            if (e.target.closest('a.project-link') || e.target.tagName === 'A') {
                return;
            }
            
            // 카드 전체 클릭으로 링크 활성화
            const link = this.$el.querySelector('a.project-link');
            if (link) {
                this.handleLinkClick(e);
            }
        },
        handleLinkClick(e) {
            e.preventDefault();
            const scrollPosition = window.pageYOffset;
            const destination = this.linkUrl;
            
            // 현재 스크롤 위치를 history state에 저장
            history.replaceState({ scrollPos: scrollPosition }, document.title);
            
            // 새 페이지로 이동
            window.location.href = destination;
        }
    }
});

// 페이지 로드 시 저장된 스크롤 위치 복원
window.addEventListener('load', function() {
    // popstate 이벤트는 뒤로가기/앞으로가기 버튼 클릭 시 발생
    window.addEventListener('popstate', function(e) {
        if (e.state && e.state.scrollPos) {
            // 약간의 지연 후 스크롤 위치 복원 (DOM이 완전히 로드된 후)
            setTimeout(() => {
                window.scrollTo(0, e.state.scrollPos);
            }, 100);
        }
    });
    
    // 페이지 첫 로드 시 현재 스크롤 위치(0,0)를 history state에 저장
    if (!history.state) {
        history.replaceState({ scrollPos: 0 }, document.title);
    }
});



// 백 버튼 컴포넌트
Vue.component('back-button', {
    props: {
        text: {
            type: String,
            default: '← Back to Portfolio'
        },
        customClass: {
            type: String,
            default: 'back-button'
        }
    },
    template: `
        <a href="../index.html" :class="customClass" @click="handleBackClick">{{ text }}</a>
    `,
    methods: {
        handleBackClick(e) {
            e.preventDefault();
            
            // 현재 스크롤 위치를 history state에 저장
            const currentScrollPos = window.pageYOffset;
            history.replaceState({ scrollPos: currentScrollPos }, document.title);
            
            // 뒤로가기 실행
            window.history.back();
        }
    }
});