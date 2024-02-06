import { ENUMS, HELPERS } from './support.js'

export default {
  'claudiodekker/ungoogled-chromium-macos': async (release) => {
    const filenamePattern = /ungoogled-chromium[_-](?<version>\d+(?:[.]\d+)+)-(?<revision>\d+)\.(?<package_revision>\d+)_(?<arch>x86-64|arm64)-macos-signed\.dmg/
    const hashesPattern = /disk image `(?<name>ungoogled-chromium_.*)`: \n\n```\nmd5: (?<md5>.*)\nsha1: (?<sha1>.*)\nsha256: (?<sha256>.*)\n```/g

    const hashes = HELPERS.extractMany(release.body, hashesPattern)

    return HELPERS.githubReleaseDefaultMapper(release, (release) => ({
      ...release,
      name: 'Ungoogled-Chromium ' + release.tag_name.split('_')[0],
      assets: release.assets.map((asset) => {
        const assetDetails = HELPERS.extract(asset.name, filenamePattern)
        const assetHashes = hashes.find((hash) => hash.name === asset.name)

        return {
          ...asset,
          arch: assetDetails.arch,
          os: ENUMS.OS.macos,
          codesigned: true,
          hashes: {
            md5: assetHashes.md5,
            sha1: assetHashes.sha1,
            sha256: assetHashes.sha256,
          },
        }
      }),
    }))
  },
  'ungoogled-software/ungoogled-chromium-macos': async (release) => {
    const filenamePattern = /ungoogled-chromium[_-](?<version>\d+(?:[.]\d+)+)-(?<revision>\d+)\.(?<package_revision>\d+)_(?<arch>x86-64|arm64)-macos\.dmg/
    const hashesPattern = /disk image `(?<name>ungoogled-chromium_.*)`: \n\n```\nmd5: (?<md5>.*)\nsha1: (?<sha1>.*)\nsha256: (?<sha256>.*)\n```/g

    const hashes = HELPERS.extractMany(release.body, hashesPattern)

    return HELPERS.githubReleaseDefaultMapper(release, (release) => ({
      ...release,
      name: 'Ungoogled-Chromium ' + release.tag_name.split('_')[0],
      assets: release.assets.map((asset) => {
        const assetDetails = HELPERS.extract(asset.name, filenamePattern)
        const assetHashes = hashes.find((hash) => hash.name === asset.name)

        return {
          ...asset,
          arch: assetDetails.arch,
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
}
