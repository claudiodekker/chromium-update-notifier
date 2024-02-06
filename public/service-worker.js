import repositories from './repositories.js'
import { store } from './store.js'
import { ENUMS } from './support.js'

const methods = {
  ensureCompatibleReleaseFormat: (release) => {
    if (!release || typeof release !== 'object') {
      throw new Error('Release is not a valid object')
    }

    if (!release.html_url || typeof release.html_url !== 'string') {
      throw new Error('Release does not contain a valid HTML url')
    }

    if (!release.name || typeof release.name !== 'string') {
      throw new Error('Release does not contain a valid release name')
    }

    if (!release.published_at || typeof release.published_at !== 'number') {
      throw new Error('Release does not contain a valid published_at time (in milliseconds)')
    }

    if (!release.assets || !Array.isArray(release.assets)) {
      throw new Error('Release does not contain any valid assets')
    }

    release.assets.forEach((asset) => {
      if (!asset || typeof asset !== 'object') {
        throw new Error('Release contains an invalid asset.')
      }

      if (!asset.name || typeof asset.name !== 'string') {
        throw new Error('Release asset does not contain a valid name.')
      }

      if (!asset.url || typeof asset.url !== 'string') {
        throw new Error('Release asset does not contain a valid download URL')
      }

      if (!asset.arch || typeof asset.arch !== 'string' || !Object.values(ENUMS.ARCH).includes(asset.arch)) {
        throw new Error('Release asset does not contain a valid arch')
      }

      if (!asset.os || typeof asset.os !== 'string' || !Object.values(ENUMS.OS).includes(asset.os)) {
        throw new Error('Release asset does not contain a valid os')
      }

      if (asset.discriminator && typeof asset.discriminator !== 'string') {
        throw new Error('Release asset does not contain a valid discriminator string.')
      }

      if (asset.codesigned !== undefined && typeof asset.codesigned !== 'boolean') {
        throw new Error('Release asset does not contain a valid codesigned flag.')
      }

      if (asset.hashes !== undefined) {
        if (typeof asset.hashes !== 'object') {
          throw new Error('Release asset contains an invalid hashes object.')
        }

        if (asset.hashes.md5 && typeof asset.hashes.md5 !== 'string' && asset.hashes.md5.length !== 32) {
          throw new Error('Release asset hashes does not contain a valid md5 hash.')
        }

        if (asset.hashes.sha1 && typeof asset.hashes.sha1 !== 'string' && asset.hashes.sha1.length !== 40) {
          throw new Error('Release asset hashes does not contain a valid sha1 hash.')
        }

        if (asset.hashes.sha256 && typeof asset.hashes.sha256 !== 'string' && asset.hashes.sha256.length !== 64) {
          throw new Error('Release asset hashes does not contain a valid sha256 hash.')
        }
      }
    })

    return release
  },
  fetchReleases: async () => {
    if (Date.now() - (await store.getLastCheckedAt()) < 1000 * 60 * 10) {
      return store.getCachedReleases()
    }

    const repository = await store.getRepository()
    const releaseParser = repositories[repository]
    if (!releaseParser) {
      throw new Error(`No release parser found for repository [${repository}]`)
    }

    const request = await fetch(`https://api.github.com/repos/${repository}/releases`)
    if (!request.ok) {
      throw new Error('Failed to fetch releases')
    }

    const releases = await request.json()
    if (!releases.length) {
      throw new Error('No releases found. Are you sure the release repository is (still) valid?')
    }

    const parsedReleases = []
    for (const release of releases) {
      const parsedRelease = await releaseParser(release)

      try {
        methods.ensureCompatibleReleaseFormat(parsedRelease)
      } catch (e) {
        console.error(e, parsedRelease)
        continue
      }

      parsedReleases.push(parsedRelease)
    }

    await store.setCachedReleases(parsedReleases)
    await store.setLastCheckedAt(Date.now())

    return parsedReleases
  },
  checkForUpdates: async () => {
    const lastUpdatedAt = await store.getLastUpdatedAt()

    const { arch, os } = await store.getPlatformInfo()

    const OSFilter = await store.getOSFilter()
    const archFilter = await store.getArchFilter()

    const filteredReleases = (await methods.fetchReleases())
      .map((release) => ({
        ...release,
        assets: release.assets.filter(function (asset) {
          return (
            (archFilter === 'detect' ? asset.arch === arch : archFilter === 'none' || asset.arch === archFilter) &&
            (OSFilter === 'detect' ? asset.os === os : OSFilter === 'none' || asset.os === OSFilter)
          )
        }),
      }))
      .filter((release) => release.assets.length > 0)

    const availableReleases = filteredReleases.filter((release) => release.published_at > lastUpdatedAt)

    await store.setLastMatchingUpdate(filteredReleases[0] || null)
    await store.setAvailableReleases(availableReleases)

    return availableReleases
  },
}

const extension = {
  configureAlarms: async () => {
    if (!(await chrome.alarms.get('update-check'))) {
      await chrome.alarms.create('update-check', { periodInMinutes: 60, delayInMinutes: 5 })
    }
  },
  setBadge: (text) => {
    chrome.action.setBadgeText({ text })
    chrome.action.setBadgeTextColor({ color: '#FFFFFF' })
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' })
  },
  update: async () => {
    const updates = await methods.checkForUpdates()

    if (updates.length > 0) {
      extension.setBadge(updates.length.toString())
    } else {
      extension.setBadge()
    }
  },
}

chrome.alarms.onAlarm.addListener(async function (alarm) {
  if (alarm.name === 'update-check') {
    await extension.update()
  }
})

chrome.runtime.onMessage.addListener(async function (request) {
  if (request.type !== 'service-worker-notification') {
    return
  }

  if (Object.keys(request.arguments).some((key) => key === 'repository')) {
    await store.resetLastCheckedAt()
    await extension.update()
  }

  if (Object.keys(request.arguments).some((key) => ['osFilter', 'archFilter'].includes(key))) {
    await extension.update()
  }
})

chrome.runtime.onStartup.addListener(async function () {
  await extension.configureAlarms()
  await extension.update()
})

chrome.runtime.onInstalled.addListener(async function (details) {
  if (details.reason === 'chrome_update' || details.reason === 'browser_update' || (await store.getLastUpdatedAt()) === 0) {
    await store.setLastUpdatedAt(Date.now())
    await store.resetLastCheckedAt()
  }

  await extension.configureAlarms()
  await extension.update()
})
