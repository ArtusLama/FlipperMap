<template>
    <UiSidebar>
        <UiSidebarHeader class="mt-20" />
        <UiSidebarContent class="px-8 py-2 flex flex-col gap-12">
            <!-- Coordinates Section -->
            <section>
                <UiSidebarGroup>
                    <UiSidebarGroupContent class="space-y-6">
                        <CoordinateInput />
                        <CoordinatesList />
                    </UiSidebarGroupContent>
                </UiSidebarGroup>
            </section>

            <!-- Areas Section -->
            <section>
                <UiSidebarGroup>
                    <UiSidebarGroupContent class="space-y-6">
                        <AreasList />
                        <div class="space-y-2">
                            <div class="flex justify-center">
                                <AreaEditorButton />
                            </div>
                            <p class="text-xs text-muted-foreground text-center">
                                To add points while editing, <strong>right-click</strong> on the map.
                            </p>
                        </div>
                    </UiSidebarGroupContent>
                </UiSidebarGroup>
            </section>
            <!-- Data manager (export/import all) -->
            <section>
                <UiSidebarGroup>
                    <UiSidebarGroupContent>
                        <div class="flex gap-2 justify-center pt-4">
                            <UiButton
                                variant="outline"
                                @click="handleExportAll"
                            >
                                <Icon
                                    name="lucide:download"
                                    class="h-4 w-4 mr-2"
                                />
                                Export All
                            </UiButton>
                            <UiButton
                                variant="default"
                                @click="handleImportClick"
                            >
                                <Icon
                                    name="lucide:upload"
                                    class="h-4 w-4 mr-2"
                                />
                                Import All
                            </UiButton>
                        </div>
                        <input
                            ref="fileInput"
                            type="file"
                            accept=".json"
                            class="hidden"
                            @change="onFileSelected"
                        >
                    </UiSidebarGroupContent>
                </UiSidebarGroup>
            </section>
        </UiSidebarContent>
    </UiSidebar>
</template>

<script setup lang="ts">
import { ref } from "vue"
import useDataManager from "~/composables/useDataManager"
import { toast } from "vue-sonner"

const { exportAll, downloadJson, importAll } = useDataManager()

// no popup anymore: import will always replace all
const fileInput = ref<HTMLInputElement | null>(null)

const handleExportAll = async () => {
    try {
        const json = exportAll()
        downloadJson(json, "flipper-map-all-backup.json")
        toast.success("Export successful", { description: "All data downloaded." })
    } catch (err) {
        toast.error("Export failed", { description: "Could not export all data." })
    }
}

const handleImportClick = () => {
    fileInput.value?.click()
}

const onFileSelected = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return
    try {
        const text = await file.text()
        const result = importAll(text, "replace")
        if (result.success) {
            toast.success("Import successful")
        } else {
            toast.error("Import failed", { description: result.error || "Unknown error" })
        }
    } catch (err) {
        toast.error("Import failed", { description: "Could not read file." })
    } finally {
        // reset
        if (fileInput.value) fileInput.value.value = ""
    }
}
</script>
