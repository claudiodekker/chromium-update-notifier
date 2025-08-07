import { ENUMS, HELPERS } from './support.js'

export default {
  'ungoogled-software/ungoogled-chromium-archlinux': async (release) => {
    const pattern = /ungoogled-chromium[_-](?:(?<debug>debug)[_-])?(?<version>\d+(?:[.]\d+)+)-(?<revision>\d+)-(?<arch>x86_64|arm64)\.pkg\.tar\.zst/g
    const hashesPattern = /(?<sha256>[A-Fa-f0-9]{64}) {2}(?<name>ungoogled-chromium.*?\.pkg\.tar\.zst)\n/g

    const hashes = HELPERS.extractMany(release.body, hashesPattern)

    return HELPERS.githubReleaseDefaultMapper(release, (release) => ({
      ...release,
      name: 'Ungoogled-Chromium ' + release.tag_name,
      assets: release.assets
        .map((asset) => {
          const assetDetails = HELPERS.extract(asset.name, pattern)
          if (Object.keys(assetDetails).length === 0) {
            return false
          }

          const assetHashes = hashes.find((hash) => hash.name === asset.name)

          return {
            ...asset,
            arch: assetDetails.arch === 'x86_64' ? ENUMS.ARCH.x86_64 : ENUMS.ARCH.arm64,
            os: ENUMS.OS.linux,
            discriminator: assetDetails.debug === 'debug' ? 'DEBUG' : undefined,
            hashes: {
              sha256: assetHashes.sha256,
            },
          }
        })
        .filter(Boolean),
    }))
  },
  'ungoogled-software/ungoogled-chromium-macos': async (release) => {
    const filenamePattern = /ungoogled-chromium[_-](?<version>\d+(?:[.]\d+)+)-(?<revision>\d+)\.(?<package_revision>\d+)_(?<arch>x86[_-]64|arm64)-macos\.dmg/
    const hashesPattern = /disk image `(?<name>ungoogled-chromium_.*?)`:[\s\S]*?```[\s\S]*?md5: (?<md5>.*)[\s\S]*?sha1: (?<sha1>.*)[\s\S]*?sha256: (?<sha256>.*)[\s\S]*?```/g

    const hashes = HELPERS.extractMany(release.body, hashesPattern)

    return HELPERS.githubReleaseDefaultMapper(release, (release) => ({
      ...release,
      name: 'Ungoogled-Chromium ' + release.tag_name.split('_')[0],
      assets: release.assets.map((asset) => {
        const assetDetails = HELPERS.extract(asset.name, filenamePattern)
        const assetHashes = hashes.find((hash) => hash.name === asset.name)

        return {
          ...asset,
          arch: assetDetails.arch.replace('_', '-'),
          os: ENUMS.OS.macos,
          hashes: {
            md5: assetHashes.md5,
            sha1: assetHashes.sha1,
            sha256: assetHashes.sha256,
          },
        }
      }),
    }))
  },
  'ungoogled-software/ungoogled-chromium-portablelinux': async (release) => {
    const pattern = /ungoogled-chromium[_-](?<version>\d+(?:[.]\d+)+)-(?<revision>\d+)\.(?<package_revision>\d+)(?<type>_linux\.tar\.xz|\.AppImage)/

    return HELPERS.githubReleaseDefaultMapper(release, (release) => ({
      ...release,
      name: 'Ungoogled-Chromium ' + release.tag_name,
      assets: release.assets.map((asset) => {
        const assetDetails = HELPERS.extract(asset.name, pattern)

        return {
          ...asset,
          arch: ENUMS.ARCH.x86_64,
          os: ENUMS.OS.linux,
          discriminator: assetDetails.type === '.AppImage' ? 'AppImage' : undefined,
        }
      }),
    }))
  },
  'ungoogled-software/ungoogled-chromium-windows': async (release) => {
    const pattern = /ungoogled-chromium[_-](?<version>\d+(?:[.]\d+)+)-(?<revision>\d+)\.(?<package_revision>\d+)_(installer|windows)_(?<arch>x64|x86)\.(?<type>exe|zip)/

    return HELPERS.githubReleaseDefaultMapper(release, (release) => ({
      ...release,
      name: 'Ungoogled-Chromium ' + release.tag_name,
      assets: release.assets.map((asset) => {
        const assetDetails = HELPERS.extract(asset.name, pattern)

        return {
          ...asset,
          arch: assetDetails.arch === 'x64' ? ENUMS.ARCH.x86_64 : ENUMS.ARCH.x86_32,
          os: ENUMS.OS.windows,
          discriminator: assetDetails.type === 'zip' ? 'zip' : 'installer',
        }
      }),
    }))
  },
  'Alex313031/Thorium-Win': async (release) => {
    const zipPattern = /(?:Thorium|thorium)_?(?<optimization>AVX2|AVX|SSE3|SSE4|Th24)?_?(?<beta>BETA\d*)?_?(?<version>\d+(?:\.\d+)+)\.zip/
    const exePattern = /(?:Thorium|thorium)_?(?<optimization>AVX2|AVX|SSE3|SSE4|Th24|WIN7)?_?(?<beta>BETA\d*)?_?(?:mini_)?installer\.exe/

    const isBeta = release.name.toLowerCase().includes('beta')

    return HELPERS.githubReleaseDefaultMapper(release, (release) => ({
      ...release,
      name: 'Thorium ' + release.tag_name + (isBeta ? ' BETA' : ''),
      assets: release.assets
        .map((asset) => {
          let assetDetails = {}
          let isZip = asset.name.endsWith('.zip')

          if (isZip) {
            assetDetails = HELPERS.extract(asset.name, zipPattern)
          } else if (asset.name.endsWith('.exe')) {
            assetDetails = HELPERS.extract(asset.name, exePattern)
          }

          if (Object.keys(assetDetails).length === 0) {
            return false
          }

          // Skip policy templates and debug shells
          if (asset.name.includes('policy_templates') || asset.name.includes('Debug_Shell')) {
            return false
          }

          let discriminator = assetDetails.optimization ? assetDetails.optimization : ''

          if (assetDetails.beta) {
            discriminator += ' BETA'
          }

          if (isZip) {
            discriminator += ' ZIP'
          }

          return {
            ...asset,
            arch: ENUMS.ARCH.x86_64,
            os: ENUMS.OS.windows,
            discriminator: discriminator.trim(),
          }
        })
        .filter(Boolean),
    }))
  },
  'Hibbiki/chromium-win64': async (release) => {
    const filenamePattern = /(?<name>\w+)\.?(?<variant>nosync|sync)?\.(?<type>exe|7z)/
    const hashesPattern = /(?<sha1>\w+) {1,2}\.\.\/out\/(?<arch>x64\/)?(?<name>.*?\.(exe|7z))/g

    const hashes = HELPERS.extractMany(release.body, hashesPattern)

    return HELPERS.githubReleaseDefaultMapper(release, (release) => ({
      ...release,
      name: 'Chromium ' + release.tag_name,
      assets: release.assets
        .map((asset) => {
          const assetDetails = HELPERS.extract(asset.name, filenamePattern)
          if (!assetDetails || Object.keys(assetDetails).length === 0) {
            return false
          }

          const assetHashes = hashes.find((hash) => hash.name === asset.name)

          let discriminator = assetDetails.type === '7z' ? '7z' : 'installer'
          if (assetDetails.variant === 'nosync') {
            discriminator = 'nosync ' + discriminator
          }

          return {
            ...asset,
            arch: ENUMS.ARCH.x86_64,
            os: ENUMS.OS.windows,
            discriminator,
            hashes: {
              sha1: assetHashes && assetHashes.sha1 ? assetHashes.sha1 : undefined,
            },
          }
        })
        .filter(Boolean),
    }))
  },
  'win32ss/supermium': async (release) => {
    const filenamePattern = /supermium_[\d_]*?_(?<arch>32|64)_(?<variant>nonsetup\.zip|setup\.exe|setup_win10_11\.exe|syms.7z)/
    const hashesPattern = /(?:\\r|\\n)*?(?<name>[\w.]+) : \d+ bytes[\s\S]+?SHA2-256 : (?<sha256>\w+)/gm

    const hashes = HELPERS.extractMany(release.body, hashesPattern)

    return HELPERS.githubReleaseDefaultMapper(release, (release) => ({
      ...release,
      assets: release.assets
        .map((asset) => {
          if (asset.name.includes('syms.7z')) {
            return false // Skip symbol files
          }

          const assetDetails = HELPERS.extract(asset.name, filenamePattern)
          const assetHashes = hashes.find((hash) => hash.name === asset.name)

          let discriminator = ''
          if (assetDetails.variant === 'nonsetup.zip') {
            discriminator = 'ZIP'
          } else if (assetDetails.variant === 'setup_win10_11.exe') {
            discriminator = 'Win10/11'
          }

          return {
            ...asset,
            arch: assetDetails.arch === '32' ? ENUMS.ARCH.x86_32 : ENUMS.ARCH.x86_64,
            os: ENUMS.OS.windows,
            discriminator,
            hashes: {
              sha256: assetHashes && assetHashes.sha256 ? assetHashes.sha256 : undefined,
            },
          }
        })
        .filter(Boolean),
    }))
  },
}
