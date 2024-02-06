<template>
  <div class="relative max-h-[450px] w-[600px] overflow-y-scroll">
    <div class="px-4 pt-4">
      <template v-if="releases.length === 0">
        <h1 class="text-base font-semibold leading-6 text-gray-600 dark:text-gray-200">
          No updates available.
        </h1>
        <div class="mt-1">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            There haven't been any releases of Chromium on the
            <span class="cursor-pointer font-medium text-gray-600 hover:underline dark:text-gray-300" @click="openBrowserTab(repositoryUrl)">{{ repository }}</span>
            repository since the last time you updated this browser.
            <br>
            <br>
            <small class="text-xs italic text-gray-400 dark:text-gray-500">
              <template v-if="lastMatchingUpdate"> This repository last published a build that matches your filter settings {{ calculateRelativeTime(lastMatchingUpdate.published_at) }}. </template>
              <template v-else> This repository hasn't published any builds that match your filter settings yet. </template>
            </small>
          </p>
        </div>
      </template>
      <template v-else>
        <div class="pb-4">
          <h1 class="text-base font-semibold leading-6 text-gray-600 dark:text-gray-200">
            Newer version{{ releases.length > 1 ? 's' : '' }} are available.
          </h1>
          <div class="mt-1">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              The
              <span class="cursor-pointer font-medium text-gray-600 hover:underline dark:text-gray-300" @click="openBrowserTab(repositoryUrl)">{{ repository }}</span>
              repository has published newer Chromium builds that match your filters since the last time you updated this browser.
            </p>
          </div>
        </div>
        <div class="space-y-4">
          <div v-for="(release, releaseIndex) in releases" :key="release.name" class="relative flex gap-x-2">
            <div :class="[releaseIndex === releases.length - 1 ? 'h-6' : '-bottom-6', 'absolute left-0 top-0 flex w-6 justify-center']">
              <div class="w-px bg-gray-300 dark:bg-gray-600" />
            </div>
            <div class="relative flex h-6 w-6 flex-none items-center justify-center bg-white dark:bg-chromiumPrimaryDark">
              <div class="h-1.5 w-1.5 rounded-full bg-yellow-400 ring-1 ring-yellow-500 dark:bg-yellow-600 dark:ring-yellow-500" />
            </div>
            <div class="flex w-full flex-col py-0.5 text-xs leading-5">
              <div class="flex w-full justify-between text-gray-500 dark:text-gray-400">
                <span><span class="cursor-pointer font-medium text-gray-600 hover:underline dark:text-gray-300" @click="openBrowserTab(release.html_url)">{{ release.name }}</span> was released.</span>
                <time :datetime="release.published_at" :title="new Date(release.published_at).toLocaleString()" class="flex-none leading-5">{{ calculateRelativeTime(release.published_at) }}</time>
              </div>
              <div class="ml-1 mt-1 flex flex-col gap-y-1">
                <div v-for="asset in release.assets" :key="asset.url" class="flex gap-x-1">
                  <span class="flex cursor-pointer gap-x-1 text-gray-500 hover:text-black dark:hover:text-white" @click="initiateDownload(asset.url)">
                    <svg class="h-5 w-5" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25"
                      />
                    </svg>
                    <span
                      v-if="asset.codesigned"
                      title="This build has been code-signed"
                      class="inline-flex items-center text-nowrap rounded-md bg-green-500/10 px-1 py-0.5 text-xs font-medium text-green-500 ring-1 ring-inset ring-green-500/30 dark:text-green-400"
                    >
                      <svg class="h-4 w-4" data-slot="icon" fill="none" stroke-width="2" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                        />
                      </svg>
                    </span>
                    <span
                      title="The operating system this build is built for"
                      class="inline-flex items-center text-nowrap rounded-md bg-green-500/10 px-2 py-0.5 text-xs font-medium text-purple-500 ring-1 ring-inset ring-purple-500/30 dark:text-purple-400"
                    >{{ formatOSLabel(asset.os) }}</span>
                    <span
                      title="The CPU architecture that this build is based on"
                      class="inline-flex items-center text-nowrap rounded-md bg-blue-400/10 px-2 py-0.5 text-xs font-medium uppercase text-blue-400 ring-1 ring-inset ring-blue-400/30"
                    >{{ formatArchLabel(asset.arch) }}</span>
                  </span>
                  <template v-if="asset.hashes">
                    <span
                      v-if="asset.hashes.md5"
                      title="Click to copy MD5 hash"
                      class="inline-flex cursor-pointer items-center rounded-md bg-slate-400/10 px-2 py-0.5 text-xs font-medium uppercase text-slate-400 ring-1 ring-inset ring-slate-400/30 hover:text-slate-500 dark:hover:text-slate-300"
                      @click="copyToClipboard(asset.hashes.md5)"
                    >MD5</span>
                    <span
                      v-if="asset.hashes.sha1"
                      title="Click to copy SHA1 hash"
                      class="inline-flex cursor-pointer items-center rounded-md bg-slate-400/10 px-2 py-0.5 text-xs font-medium uppercase text-slate-400 ring-1 ring-inset ring-slate-400/30 hover:text-slate-500 dark:hover:text-slate-300"
                      @click="copyToClipboard(asset.hashes.sha1)"
                    >SHA1</span>
                    <span
                      v-if="asset.hashes.sha256"
                      title="Click to copy SHA256 hash"
                      class="inline-flex cursor-pointer items-center rounded-md bg-slate-400/10 px-2 py-0.5 text-xs font-medium uppercase text-slate-400 ring-1 ring-inset ring-slate-400/30 hover:text-slate-500 dark:hover:text-slate-300"
                      @click="copyToClipboard(asset.hashes.sha256)"
                    >SHA256</span>
                  </template>
                  <span
                    v-if="asset.discriminator"
                    title="This is a special field to distinguish otherwise identical builds"
                    class="inline-flex items-center text-nowrap rounded-md bg-pink-500/10 px-2 py-0.5 text-xs font-medium uppercase text-pink-500 ring-1 ring-inset ring-pink-500/30 dark:text-pink-400"
                  >{{ asset.discriminator }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div class="sticky bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-white dark:to-chromiumPrimaryDark" />
  </div>
</template>

<script>
import { ENUMS } from '../public/support.js'

export default {
  name: 'PopupPage',
  data: () => ({
    repository: '<unknown>',
    releases: [],
    lastMatchingUpdate: null,
  }),
  computed: {
    repositoryUrl() {
      return 'https://github.com/' + this.repository
    },
  },
  watch: {
    releases: {
      deep: true,
      immediate: true,
      async handler(releases) {
        this.lastMatchingUpdate = releases.length === 0 ? await this.$store.getLastMatchingUpdate() : null
      },
    },
  },
  async mounted() {
    this.repository = await this.$store.getRepository()
    this.releases = await this.$store.getAvailableReleases()
  },
  methods: {
    openBrowserTab(url) {
      chrome.tabs.create({ url })
    },
    initiateDownload(url) {
      chrome.downloads.download({ url })
    },
    copyToClipboard(text) {
      navigator.clipboard.writeText(text)
    },
    formatOSLabel(os) {
      return ENUMS.OS_LABELS[os] || os
    },
    formatArchLabel(arch) {
      return ENUMS.ARCH_LABELS[arch] || arch
    },
    formatIntervalAgo(seconds, unit, secondsPerUnit) {
      const amount = Math.floor(seconds / secondsPerUnit)

      return `${amount} ${unit}${amount > 1 ? 's' : ''} ago`
    },
    calculateRelativeTime(timestamp) {
      const currentTime = new Date()
      const postTime = new Date(timestamp)

      const timeDifference = currentTime - postTime
      const secondsDifference = Math.floor(timeDifference / 1000)

      if (secondsDifference === 0) {
        return 'Just now'
      } else if (secondsDifference < 60) {
        return this.formatIntervalAgo(secondsDifference, 'second', 1)
      } else if (secondsDifference < 3600) {
        return this.formatIntervalAgo(secondsDifference, 'minute', 60)
      } else if (secondsDifference < 86400) {
        return this.formatIntervalAgo(secondsDifference, 'hour', 3600)
      } else if (secondsDifference < 31536000) {
        return this.formatIntervalAgo(secondsDifference, 'day', 86400)
      }

      return this.formatIntervalAgo(secondsDifference, 'year', 31536000)
    },
  },
}
</script>
