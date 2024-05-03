import { createApp } from 'vue'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import './style.css'
import App from './App.vue'
const app = createApp(App)
const vuetify = createVuetify({
    components,
    directives,
})
app.use(vuetify)
app.mount('#app')