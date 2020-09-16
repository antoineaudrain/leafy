import { readdirSync, statSync, readFileSync } from 'fs'
import { basename, extname, join } from 'path'
import crypto from 'crypto'

const types = {
  FILE: 'FILE',
  DIRECTORY: 'DIRECTORY'
}

const characters = {
  LAST_ELEMENT: '└─',
  ELEMENT: '├─',
  IN_DIRECTORY: ' │',
  EMPTY: '  '
}

const fontSpecial = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  DIM: '\x1b[2m',
  UNDERSCORE: '\x1b[4m',
  BLINK: '\x1b[5m',
  REVERSE: '\x1b[7m',
  HIDDEN: '\x1b[8m'
}

const fontColors = {
  BLACK: '\x1b[37m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[30m'
}

const bgColors = {
  BLACK: '\x1b[40m',
  RED: '\x1b[41m',
  GREEN: '\x1b[42m',
  YELLOW: '\x1b[43m',
  BLUE: '\x1b[44m',
  MAGENTA: '\x1b[45m',
  CYAN: '\x1b[46m',
  WHITE: '\x1b[47m'
}

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
  const name = basename(path)
  const currentNode = { name }

  if (!options?.gui) {
    currentNode.path = path
  }

  if (options?.exclude) {
    const exclusions = typeof options?.exclude === 'object' ? options.exclude : [options.exclude]
    if (exclusions.some((exclusion) => path.includes(exclusion))) {
      return null
    }
  }

  if (stats.isFile()) {

    if (!options?.gui) {
      currentNode.size = stats.size
      currentNode.extension = extname(path).toLowerCase() || null
    }
    if (options?.hash) {
      const data = readFileSync(path)
      currentNode.hash = '#' + crypto.createHash('sha1').update(data).digest('hex').slice(0, 7)
    }
    currentNode.type = types.FILE
    currentNode.hidden = currentNode.name.substr(0, 1) === '.'

  } else if (stats.isDirectory()) {
    const dirData = safeReadDirSync(path)

    if (dirData) {
      const children = dirData
        .map(child => directoryTree(join(path, child), options))
        .filter(e => !!e)

      currentNode.children = children
      if (!options?.gui) {
        currentNode.size = children.reduce((prev, cur) => prev + cur.size, 0)
      }
      currentNode.type = types.DIRECTORY
    }
  } else {
    return null
  }

  return currentNode
}

const chalk = (text, options) => {
  if (!options) {
    return text
  }
  const { color = '', special = '', background = '' } = options
  return color + special + background + text + fontSpecial.RESET
}

const drawAsciiTree = (nodes, depth = 0, fillers = [], colors = undefined) => nodes.map((node, index) => {
  const isLastNode = index === nodes.length - 1
  const isDirWithNodes = node.type === types.DIRECTORY && !!node?.children.length

  console.log(
    chalk(fillers.join('')),
    chalk(isLastNode ? characters.LAST_ELEMENT : characters.ELEMENT, { color: colors?.structure ? fontColors[colors?.structure] : '' }),
    chalk(node.name, { color: colors?.name ? fontColors[colors?.name] : '' }),
    (node.type === types.FILE && !node?.hidden) ? chalk(node.hash, { color: colors?.hash ? fontColors[colors?.hash] : '' }) : ''
  )

  if (isDirWithNodes) {

    drawAsciiTree(
      node.children,
      depth + 1,
      [
        ...fillers,
        chalk(
        isLastNode ? characters.EMPTY : characters.IN_DIRECTORY,
        { color: colors?.structure ? fontColors[colors?.structure] : '' }
        )
      ],
      colors
    )
  }
})

export default (path, options) => {
  const nodes = directoryTree(path, options)
  if (options?.gui || true) {
    console.log(nodes.name)
    drawAsciiTree(nodes.children, 0, [], options?.colors)
  }
}

