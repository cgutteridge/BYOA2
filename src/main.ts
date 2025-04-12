import {createApp} from 'vue'
import {createPinia} from 'pinia'
import App from './App.vue'
import './style.css'
import './styles/monsterStyles.css'
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
        state.persist.map((key: any) => {
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
    if (questStore.currentPub === undefined) {
        appStore.setScreen('map')
    } else {
        appStore.setScreen('location')
    }
} else {
    appStore.setScreen('start_quest')
}

app.mount('#app') 