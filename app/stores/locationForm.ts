import { defineStore } from "pinia"
import { ref } from "vue"

export const useLocationFormStore = defineStore("locationForm", () => {
    const address = ref("")
    const lat = ref<number | undefined>(undefined)
    const lng = ref<number | undefined>(undefined)
    const name = ref("")
    const color = ref("#3B82F6")

    const fillForm = (newLat: number, newLng: number, newName?: string, newColor?: string) => {
        lat.value = newLat
        lng.value = newLng
        if (newName) {
            name.value = newName
        }
        if (newColor) {
            color.value = newColor
        }
        address.value = ""
    }

    const resetForm = () => {
        address.value = ""
        lat.value = undefined
        lng.value = undefined
        name.value = ""
        color.value = "#3B82F6"
    }

    return {
        address,
        lat,
        lng,
        name,
        color,
        fillForm,
        resetForm,
    }
})
