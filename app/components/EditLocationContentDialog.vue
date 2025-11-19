<template>
    <UiDialog v-model:open="isOpen">
        <UiDialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
            <UiDialogHeader>
                <UiDialogTitle>Edit Location Details</UiDialogTitle>
                <UiDialogDescription>
                    Add notes and images to {{ locationName || 'this location' }}
                </UiDialogDescription>
            </UiDialogHeader>

            <div class="space-y-6 py-4">
                <!-- Notes Section -->
                <div class="space-y-2">
                    <label
                        for="notes"
                        class="text-sm font-medium"
                    >
                        Notes
                    </label>
                    <UiTextarea
                        id="notes"
                        v-model="localNotes"
                        placeholder="Add notes about this location..."
                        class="min-h-[120px] resize-y"
                    />
                </div>

                <!-- Images Section -->
                <div class="space-y-3">
                    <label class="text-sm font-medium">
                        Images
                    </label>

                    <!-- Image Grid -->
                    <div
                        v-if="localImages.length > 0"
                        class="grid grid-cols-2 sm:grid-cols-3 gap-3"
                    >
                        <div
                            v-for="(image, index) in localImages"
                            :key="index"
                            class="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
                        >
                            <img
                                :src="image"
                                :alt="`Image ${index + 1}`"
                                class="w-full h-full object-cover"
                            >
                            <UiButton
                                variant="destructive"
                                size="icon"
                                class="absolute top-1 right-1 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                @click="removeImage(index)"
                            >
                                <Icon
                                    name="lucide:trash-2"
                                    size="16"
                                />
                            </UiButton>
                        </div>
                    </div>

                    <!-- Upload Area -->
                    <div
                        class="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
                        :class="isDragging ? 'border-primary bg-primary/5' : 'border-border'"
                        @dragover.prevent="isDragging = true"
                        @dragleave.prevent="isDragging = false"
                        @drop.prevent="handleDrop"
                    >
                        <Icon
                            name="lucide:image-plus"
                            size="32"
                            class="mx-auto mb-3 text-muted-foreground"
                        />
                        <p class="text-sm text-muted-foreground mb-2">
                            Drag and drop images here, or
                        </p>
                        <UiButton
                            type="button"
                            variant="outline"
                            size="sm"
                            @click="triggerFileInput"
                        >
                            <Icon
                                name="lucide:upload"
                                size="16"
                                class="mr-2"
                            />
                            Choose Files
                        </UiButton>
                        <input
                            ref="fileInput"
                            type="file"
                            accept="image/*"
                            multiple
                            class="hidden"
                            @change="handleFileSelect"
                        >
                        <p class="text-xs text-muted-foreground mt-2">
                            PNG, JPG, GIF up to 2MB each
                        </p>
                    </div>
                </div>
            </div>

            <UiDialogFooter>
                <UiButton
                    variant="outline"
                    @click="cancel"
                >
                    Cancel
                </UiButton>
                <UiButton @click="save">
                    Save Changes
                </UiButton>
            </UiDialogFooter>
        </UiDialogContent>
    </UiDialog>
</template>

<script setup lang="ts">
import { toast } from "vue-sonner"
import { useCoordinatesStore } from "~/stores/coordinates"
import type { Coordinate } from "../../types"

interface Props {
    coordinate: Coordinate
    open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
    "update:open": [value: boolean]
}>()

const coordinatesStore = useCoordinatesStore()

// Local state
const localNotes = ref(props.coordinate.notes || "")
const localImages = ref<string[]>([...(props.coordinate.images || [])])
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const isOpen = computed({
    get: () => props.open,
    set: value => emit("update:open", value),
})

const locationName = computed(() => props.coordinate.name)

// Watch for prop changes to update local state
watch(() => props.coordinate, (newCoord) => {
    localNotes.value = newCoord.notes || ""
    localImages.value = [...(newCoord.images || [])]
}, { deep: true })

const triggerFileInput = () => {
    fileInput.value?.click()
}

const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const files = target.files
    if (!files) return

    await processFiles(Array.from(files))
    // Reset input
    if (target) target.value = ""
}

const handleDrop = async (event: DragEvent) => {
    isDragging.value = false
    const files = event.dataTransfer?.files
    if (!files) return

    await processFiles(Array.from(files))
}

const processFiles = async (files: File[]) => {
    const maxSize = 2 * 1024 * 1024 // 2MB
    const validFiles = files.filter((file) => {
        if (!file.type.startsWith("image/")) {
            toast.error(`${file.name} is not an image file`)
            return false
        }
        if (file.size > maxSize) {
            toast.error(`${file.name} is too large (max 2MB)`)
            return false
        }
        return true
    })

    for (const file of validFiles) {
        try {
            const base64 = await fileToBase64(file)
            localImages.value.push(base64)
        } catch (error) {
            toast.error(`Failed to process ${file.name}`)
            console.error(error)
        }
    }

    if (validFiles.length > 0) {
        toast.success(`Added ${validFiles.length} image(s)`)
    }
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

const removeImage = (index: number) => {
    localImages.value.splice(index, 1)
    toast.info("Image removed")
}

const save = () => {
    coordinatesStore.updateCoordinate(props.coordinate.id, {
        notes: localNotes.value.trim() || undefined,
        images: localImages.value.length > 0 ? localImages.value : undefined,
    })
    toast.success("Location details saved")
    isOpen.value = false
}

const cancel = () => {
    // Reset to original values
    localNotes.value = props.coordinate.notes || ""
    localImages.value = [...(props.coordinate.images || [])]
    isOpen.value = false
}
</script>
