<template>
  <div class="flex justify-center">
    <div class="container flex w-full max-w-2xl flex-col p-6">
      <h1 class="text-2xl font-medium tracking-tight text-slate-700 dark:text-slate-300">
        Chromium Update Notifier Settings
      </h1>
      <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label for="repository" class="block text-sm font-medium text-gray-900 dark:text-gray-300">Repository</label>
          <span class="text-xs text-gray-600 dark:text-gray-400">The repository used to check for new release builds.</span>
          <div class="mt-2">
            <select
              v-model="repository"
              name="repository"
              class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-indigo-500 **:text-black"
            >
              <option v-for="repositoryLabel in repositories" :key="repositoryLabel" :value="repositoryLabel">
                {{ repositoryLabel }}
              </option>
            </select>
          </div>
        </div>
        <div class="sm:col-span-1">
          <label for="os" class="block text-sm font-medium text-gray-900 dark:text-gray-300">Operating System</label>
          <span class="text-xs text-gray-600 dark:text-gray-400">The operating system you're interested in.</span>
          <div class="mt-2">
            <select
              v-model="osFilter"
              name="os"
              class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-indigo-500 **:text-black"
            >
              <option v-for="(osFilterLabel, osFilterKey) in osFilterOptions" :key="osFilterLabel" :value="osFilterKey">
                {{ osFilterLabel }}
              </option>
            </select>
          </div>
        </div>
        <div class="sm:col-span-1">
          <label for="arch" class="block text-sm font-medium text-gray-900 dark:text-gray-300">Architecture</label>
          <span class="text-xs text-gray-600 dark:text-gray-400">The release architecture you're interested in.</span>
          <div class="mt-2">
            <select
              v-model="archFilter"
              name="arch"
              class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-indigo-500 **:text-black"
            >
              <option v-for="(archFilterLabel, archFilterKey) in archFilterOptions" :key="archFilterLabel" :value="archFilterKey">
                {{ archFilterLabel }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import repositories from '../public/repositories.js'
import { ENUMS } from '../public/support.js'

export default {
  name: 'OptionsPage',
  data: () => ({
    repository: '',
    osFilter: null,
    archFilter: null,
    ready: false,
  }),
  computed: {
    repositories() {
      return Object.keys(repositories)
    },
    osFilterOptions() {
      return {
        detect: 'Detect automatically',
        none: 'All operating systems',
        ...ENUMS.OS_LABELS,
      }
    },
    archFilterOptions() {
      return {
        detect: 'Detect automatically',
        none: 'All architectures',
        ...ENUMS.ARCH_LABELS,
      }
    },
  },
  watch: {
    async repository(value) {
      if (this.ready) {
        await this.$store.setRepository(value)
        await this.$store.notifyServiceWorker({ repository: value })
      }
    },
    async osFilter(value) {
      if (this.ready) {
        await this.$store.setOSFilter(value)
        await this.$store.notifyServiceWorker({ osFilter: value })
      }
    },
    async archFilter(value) {
      if (this.ready) {
        await this.$store.setArchFilter(value)
        await this.$store.notifyServiceWorker({ archFilter: value })
      }
    },
  },
  async beforeCreate() {
    this.repository = await this.$store.getRepository()
    this.osFilter = await this.$store.getOSFilter()
    this.archFilter = await this.$store.getArchFilter()
    this.ready = true
  },
}
</script>
