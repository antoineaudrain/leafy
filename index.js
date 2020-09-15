import { readdirSync, statSync } from 'fs'
import { basename, extname, join } from 'path'

const safeReadDirSync = (path) => {
  let dirData = {}
  try {
    dirData = readdirSync(path)
  } catch (error) {
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      return null
    }
    throw new Error(error)
  }
  return dirData
}

const normalizePath = (path) => path.replace(/\\/g, '/')

const directoryTree = (path, options) => {
  path = options?.normalizePath ? normalizePath(path) : path

  const stats = statSync(path)

  if (options?.exclude) {
    if ([options.exclude].some((exclusion) => path.includes(exclusion))) {
      return null
    }
  }

  if (stats.isFile()) {
    return {
      path,
      name: basename(path),
      size: stats.size,
      extension: extname(path).toLowerCase() || null,
      type: 'file'
    }

  } else if (stats.isDirectory()) {
    const dirData = safeReadDirSync(path)

    if (dirData) {
      const children = dirData
        .map(child => directoryTree(join(path, child), options))
        .filter(e => !!e)

      return {
        path,
        name: basename(path),
        children,
        size: children.reduce((prev, cur) => prev + cur.size, 0),
        type: 'directory'
      }
    }
  }

  return null
}

console.log(directoryTree('../../../Desktop', { normalizePath: true, exclude: '../../../Desktop/cooky-assets' }))