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
                                Um Punkte während der Bearbeitung hinzuzufügen, <strong>Rechtsklick</strong> auf die Karte.
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
                                Exportieren
                            </UiButton>
                            <UiButton
                                variant="default"
                                @click="handleImportClick"
                            >
                                <Icon
                                    name="lucide:upload"
                                    class="h-4 w-4 mr-2"
                                />
                                Importieren
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
        toast.success("Export erfolgreich", { description: "Alle Daten wurden heruntergeladen." })
    } catch (err) {
        toast.error("Export fehlgeschlagen", { description: "Daten konnten nicht exportiert werden." })
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
            toast.success("Import erfolgreich")
        } else {
            toast.error("Import fehlgeschlagen", { description: result.error || "Unbekannter Fehler" })
        }
    } catch (err) {
        toast.error("Import fehlgeschlagen", { description: "Datei konnte nicht gelesen werden." })
    } finally {
        // reset
        if (fileInput.value) fileInput.value.value = ""
    }
}
</script>
