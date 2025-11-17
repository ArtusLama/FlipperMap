import { defineStore } from "pinia"
import { ref } from "vue"
import type { LocationType } from "~/types"

export const useLocationFormStore = defineStore("locationForm", () => {
    const address = ref("")
    const lat = ref<number | undefined>(undefined)
    const lng = ref<number | undefined>(undefined)
    const name = ref("")
    const color = ref("#3B82F6")
    const locationType = ref<LocationType | undefined>(undefined)

    const fillForm = (newLat: number, newLng: number, newName?: string, newColor?: string, newLocationType?: LocationType) => {
        lat.value = newLat
        lng.value = newLng
        if (newName) {
            name.value = newName
        }
        if (newColor) {
            color.value = newColor
        }
        if (newLocationType) {
            locationType.value = newLocationType
        }
        address.value = ""
    }

    const resetForm = () => {
        address.value = ""
        lat.value = undefined
        lng.value = undefined
        name.value = ""
        color.value = "#3B82F6"
        locationType.value = undefined
    }

    return {
        address,
        lat,
        lng,
        name,
        color,
        locationType,
        fillForm,
        resetForm,
    }
})
