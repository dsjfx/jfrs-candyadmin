import { ref, computed } from 'vue'

const masterRef = ref<string>((import.meta.env.VITE_APP_TITLE_MASTER || '').toString().trim())
const slaveRef = ref<string>((import.meta.env.VITE_APP_TITLE_SLAVE || '').toString().trim())

export function useAppName(suffix: string = '') {
    const appName = computed(() => {
        const m = masterRef.value
        const s = slaveRef.value
        if (m && s) return `${m} · ${s}${suffix}`
        if (m) return m
        if (s) return s
        return '糖果管理平台'
    })

    const setMaster = (v: string) => { masterRef.value = v?.toString().trim() || '' }
    const setSlave = (v: string) => { slaveRef.value = v?.toString().trim() || '' }

    return {
        master: masterRef,
        slave: slaveRef,
        appName,
        setMaster,
        setSlave,
    }
}