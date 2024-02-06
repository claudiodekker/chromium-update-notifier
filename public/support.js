export const ENUMS = {
  ARCH: {
    arm: 'arm',
    arm64: 'arm64',
    x86_32: 'x86-32',
    x86_64: 'x86-64',
  },
  ARCH_LABELS: {
    arm: 'ARM',
    arm64: 'ARM64',
    'x86-32': 'x86-32',
    'x86-64': 'x86-64',
  },
  OS: {
    macos: 'mac',
    windows: 'win',
    linux: 'linux',
    openbsd: 'openbsd',
  },
  OS_LABELS: {
    mac: 'macOS',
    win: 'Windows',
    linux: 'Linux',
    openbsd: 'OpenBSD',
  },
}

export const HELPERS = {
  promisify: function (thisArg, fnName) {
    const fn = thisArg[fnName]
    return function () {
      return new Promise((resolve, reject) => {
        fn.call(thisArg, ...arguments, function () {
          const lastError = chrome.runtime.lastError
          if (lastError instanceof Object) {
            return reject(lastError.message)
          }
          resolve(...arguments)
        })
      })
    }
  },
  extract: (input, regex) => {
    let m
    if ((m = regex.exec(input)) !== null) {
      return m.groups
    }

    return {}
  },
  extractMany: (input, regex) => {
    const parsed = []
    let m = []

    while ((m = regex.exec(input)) !== null) {
      if (m.index === regex.lastIndex) {
        regex.lastIndex++
      }

      parsed.push(m.groups)
    }

    return parsed
  },
  githubReleaseDefaultMapper: async (release, callback) => {
    const mapped = {
      ...release,
      html_url: release.html_url,
      release: release.tag_name,
      published_at: Date.parse(release.published_at),
      assets: release.assets.map((asset) => ({
        ...asset,
        name: asset.name,
        url: asset.browser_download_url,
      })),
    }

    if (typeof callback === 'function') {
      return await callback(mapped)
    }

    return mapped
  },
}
