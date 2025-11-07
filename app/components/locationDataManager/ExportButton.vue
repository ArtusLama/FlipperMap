<template>
    <UiButton
        variant="ghost"
        size="icon"
        title="Export locations as JSON"
        @click="handleExport"
    >
        <Icon
            name="lucide:download"
            class="h-4 w-4"
        />
    </UiButton>
</template>

<script setup lang="ts">
import { toast } from "vue-sonner"
import { useCoordinatesStore } from "~/stores/coordinates"

const coordinatesStore = useCoordinatesStore()

const handleExport = async () => {
    try {
        const jsonData = coordinatesStore.exportCoordinates()

        // Create blob and trigger download with save dialog
        const blob = new Blob([jsonData], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = "flipper-map-locations-backup.json"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast.success("Export successful", {
            description: "Your locations have been downloaded.",
        })
    } catch (error) {
        toast.error("Export failed", {
            description: "An error occurred while exporting your locations.",
        })
    }
}
</script>
