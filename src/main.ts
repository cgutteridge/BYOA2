import {createApp} from 'vue'
import {createPinia} from 'pinia'
import App from './App.vue'
import './style.css'
import {useQuestStore} from "./stores/questStore";
import {useAppStore} from "./stores/appStore";

const app = createApp(App)
const pinia = createPinia()

// Add persistence plugin
pinia.use(({store}) => {

    // Skip persistence for app store
    if (store.$id === 'app') {
        return
    }

    const savedState = localStorage.getItem(`pinia-${store.$id}`)
    if (savedState) {
        const parsedState = JSON.parse(savedState)
        // Restore  properties
        Object.keys(parsedState).forEach(key => {
            if (key in store) {
                store[key] = parsedState[key]
            }
        })
    }

    // @ts-ignore
    store.$subscribe((mutation, state) => {
        // Save properties
        const stateToSave: Record<string, any> = {}
        if (!state.persist) {
            console.warn(`${store.$id} is missing persist property`)
            return
        }
        
        // Handle both ref and regular array persist properties
        const persistKeys = Array.isArray(state.persist) ? state.persist : state.persist.value
        
        if (!Array.isArray(persistKeys)) {
            console.warn(`${store.$id} has invalid persist property (not an array)`)
            return
        }
        
        persistKeys.forEach((key: string) => {
            stateToSave[key] = state[key]
        })
        
        const json = JSON.stringify(stateToSave)
        localStorage.setItem(`pinia-${store.$id}`, json)
    })
})

app.use(pinia)

const questStore = useQuestStore()
const appStore = useAppStore()

if (questStore.status === 'active') {
    // console.log(questStore)
    if (questStore.currentGameLocation === undefined) {
        appStore.setScreen('map')
        // Start route tracking if we're on the map screen
        appStore.startRouteTracking()
    } else {
        appStore.setScreen('location')
    }
} else {
    appStore.setScreen('start_quest')
}

app.mount('#app') 