<template>
    <UiSidebar>
        <UiSidebarHeader class="mt-20" />
        <UiSidebarContent class="px-8 flex flex-col gap-12">
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
        </UiSidebarContent>
    </UiSidebar>
</template>
