import { ref } from "vue"

let formInstance: ReturnType<typeof createLocationForm> | null = null

function createLocationForm() {
    const address = ref("")
    const lat = ref<number | string>("")
    const lng = ref<number | string>("")
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
        lat.value = ""
        lng.value = ""
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
}

export default function useLocationForm() {
    if (!formInstance) {
        formInstance = createLocationForm()
    }
    return formInstance
}
