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
    faTriangleExclamation, faUser, faRightFromBracket, faCloudArrowUp, faBell
} from '@fortawesome/free-solid-svg-icons'

library.add(
    faSun, faMoon, faEdit, faTrash, faSearch, faList, faGrip,
    faCalendarDays, faGear, faPlus, faSave, faXmark, faUndo,
    faCheck, faCircle, faFolder, faChevronLeft, faChevronRight,
    faTriangleExclamation, faUser, faRightFromBracket, faCloudArrowUp, faBell
)

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(createPinia())
app.use(router)
app.mount('#app')
