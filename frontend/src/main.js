import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

/* Font Awesome */
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
    faSun, faMoon, faEdit, faTrash, faSearch, faList, faGrip,
    faCalendarDays, faGear, faPlus, faSave, faXmark, faUndo,
    faCheck, faCircle, faFolder, faChevronLeft, faChevronRight,
    faTriangleExclamation, faUser, faRightFromBracket, faCloudArrowUp, faBell,
    faLock, faRocket, faHeart, faMagnifyingGlass, faSortAmountDown,
    faCalendar, faFire, faSnowflake, faFont, faTag, faCircleCheck,
    faCircleXmark, faBars, faTags, faGripVertical, faClock, faStar,
    faFilter, faArrowDown, faArrowUp, faPlug, faRotate, faFileLines
} from '@fortawesome/free-solid-svg-icons'
import { faGoogle, faApple } from '@fortawesome/free-brands-svg-icons'

library.add(
    faSun, faMoon, faEdit, faTrash, faSearch, faList, faGrip,
    faCalendarDays, faGear, faPlus, faSave, faXmark, faUndo,
    faCheck, faCircle, faFolder, faChevronLeft, faChevronRight,
    faTriangleExclamation, faUser, faRightFromBracket, faCloudArrowUp, faBell,
    faLock, faRocket, faHeart, faMagnifyingGlass, faSortAmountDown,
    faCalendar, faFire, faSnowflake, faFont, faTag, faCircleCheck,
    faCircleXmark, faBars, faTags, faGripVertical, faClock, faStar,
    faFilter, faArrowDown, faArrowUp, faPlug, faRotate, faFileLines,
    faGoogle, faApple
)

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Initialize auth
import { useAuthStore } from './stores/authStore'
const authStore = useAuthStore(pinia)
authStore.checkAuth()

app.mount('#app')
