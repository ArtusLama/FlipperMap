<template>
    <UiDialog v-model:open="isOpen">
        <UiDialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
            <UiDialogHeader>
                <UiDialogTitle>{{ locationName || 'Location Details' }}</UiDialogTitle>
                <UiDialogDescription
                    v-if="coordinate.locationType"
                    class="flex items-center gap-2"
                >
                    <Icon
                        :name="useLocationTypeIcon().getIconName(coordinate.locationType)"
                        :size="18"
                        :style="{ color: coordinate.color }"
                    />
                    <span>{{ coordinate.locationType }}</span>
                </UiDialogDescription>
            </UiDialogHeader>

            <div class="space-y-6 py-4">
                <!-- Notes -->
                <div
                    v-if="coordinate.notes"
                    class="space-y-2"
                >
                    <h3 class="text-sm font-semibold">
                        Notes
                    </h3>
                    <p class="text-sm whitespace-pre-wrap text-muted-foreground">
                        {{ coordinate.notes }}
                    </p>
                </div>

                <!-- Images -->
                <div
                    v-if="coordinate.images && coordinate.images.length > 0"
                    class="space-y-3"
                >
                    <h3 class="text-sm font-semibold">
                        Images ({{ coordinate.images.length }})
                    </h3>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <button
                            v-for="(image, index) in coordinate.images"
                            :key="index"
                            type="button"
                            class="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted hover:ring-2 hover:ring-primary transition-all"
                            @click="openImagePreview(image)"
                        >
                            <img
                                :src="image"
                                :alt="`Image ${index + 1}`"
                                class="w-full h-full object-cover"
                            >
                            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Icon
                                    name="lucide:zoom-in"
                                    size="24"
                                    class="text-white"
                                />
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <UiDialogFooter>
                <UiButton
                    variant="outline"
                    @click="isOpen = false"
                >
                    Close
                </UiButton>
            </UiDialogFooter>
        </UiDialogContent>
    </UiDialog>

    <!-- Image Preview Dialog -->
    <UiDialog v-model:open="imagePreviewOpen">
        <UiDialogContent class="max-w-5xl p-0">
            <div class="relative">
                <img
                    v-if="previewImage"
                    :src="previewImage"
                    alt="Full size preview"
                    class="w-full h-auto"
                >
            </div>
        </UiDialogContent>
    </UiDialog>
</template>

<script setup lang="ts">
import type { Coordinate } from "../../types"

interface Props {
    coordinate: Coordinate
    open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
    "update:open": [value: boolean]
}>()

const isOpen = computed({
    get: () => props.open,
    set: value => emit("update:open", value),
})

const locationName = computed(() => props.coordinate.name)

// Image preview
const imagePreviewOpen = ref(false)
const previewImage = ref<string | null>(null)

const openImagePreview = (image: string) => {
    previewImage.value = image
    imagePreviewOpen.value = true
}
</script>
