import { createApp } from 'vue'
import App from './App.vue'
import './assets/tailwind.css'
import 'overlayscrollbars/overlayscrollbars.css'

// Import OverlayScrollbars
import { OverlayScrollbars } from 'overlayscrollbars'
import {
    ScrollbarsHidingPlugin,
    SizeObserverPlugin
} from 'overlayscrollbars'

// Register plugins
OverlayScrollbars.plugin(ScrollbarsHidingPlugin)
OverlayScrollbars.plugin(SizeObserverPlugin)

// Create app
const app = createApp(App)

// Mount app
app.mount('#app')

// Initialize OverlayScrollbars on the body with hidden scrollbars
document.documentElement.setAttribute('data-overlayscrollbars-initialize', '')
document.body.setAttribute('data-overlayscrollbars-initialize', '')

OverlayScrollbars(document.body, {
    scrollbars: {
        visibility: 'hidden',
        autoHide: 'scroll',
        autoHideDelay: 400,
    },
    overflow: {
        x: 'hidden',
        y: 'scroll',
    }
})