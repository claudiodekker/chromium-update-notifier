import { HELPERS } from './support.js'

const storage = {
  clear: chrome.storage ? HELPERS.promisify(chrome.storage.local, 'clear') : () => {},
  get: chrome.storage ? HELPERS.promisify(chrome.storage.local, 'get') : () => {},
  set: chrome.storage ? HELPERS.promisify(chrome.storage.local, 'set') : () => {},
  getOrDefault: function (key, fallback = undefined) {
    return () => storage.get(key).then((item) => {
      const value = item[key]
      if (value !== undefined) {
        return value
      }

      return typeof fallback === 'function' ? fallback() : fallback
    })
  },
}

const determineDefaultRepository = async () => {
  const defaultRepositories = {
    win: 'ungoogled-software/ungoogled-chromium-windows',
    linux: 'ungoogled-software/ungoogled-chromium-portablelinux',
    mac: 'ungoogled-software/ungoogled-chromium-macos',
  }
  
  try {
    const platformInfo = await store.getPlatformInfo()
    return defaultRepositories[platformInfo.os] || defaultRepositories.mac
  } catch (error) {
    console.error('Error determining default repository:', error)
    return defaultRepositories.mac
  }
}

export const store = {
  notifyServiceWorker: async function (args) {
    chrome.runtime.sendMessage({
      type: 'service-worker-notification',
      arguments: args,
    })
  },
  getPlatformInfo: () => HELPERS.promisify(chrome.runtime, 'getPlatformInfo')(),
  setRepository: (repository) => storage.set({ repository }),
  getRepository: storage.getOrDefault('repository', determineDefaultRepository),
  resetDefaultRepository: async () => await store.setRepository(await determineDefaultRepository()),

  setOSFilter: (OSFilter) => storage.set({ OSFilter }),
  getOSFilter: storage.getOrDefault('OSFilter', 'detect'),

  setArchFilter: (archFilter) => storage.set({ archFilter }),
  getArchFilter: storage.getOrDefault('archFilter', 'detect'),

  setLastCheckedAt: (lastCheckedAt) => storage.set({ lastCheckedAt }),
  resetLastCheckedAt: () => store.setLastCheckedAt(0),
  getLastCheckedAt: storage.getOrDefault('lastCheckedAt', 0),

  setCachedReleases: (releases) => storage.set({ releases }),
  getCachedReleases: storage.getOrDefault('releases', []),

  setAvailableReleases: (availableReleases) => storage.set({ availableReleases }),
  getAvailableReleases: storage.getOrDefault('availableReleases', []),

  setLastMatchingUpdate: (lastMatchingUpdate) => storage.set({ lastMatchingUpdate }),
  getLastMatchingUpdate: storage.getOrDefault('lastMatchingUpdate', null),

  setLastUpdatedAt: (lastUpdatedAt) => storage.set({ lastUpdatedAt }),
  getLastUpdatedAt: storage.getOrDefault('lastUpdatedAt', 0),
}
