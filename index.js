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

const drawLine = (index, nodes, node, depth) => console.log(
  chalk(characters.IN_DIRECTORY.repeat(depth)),
  chalk(index === nodes.length - 1 && node.type !== types.DIRECTORY ? characters.LAST_ELEMENT : characters.ELEMENT),
  chalk(node.name),
  (node.type === types.FILE && !node?.hidden) ? chalk(node.hash, { color: fontColors.BLUE }) : ''
)

const drawAsciiTree = (nodes, depth = 0) => {
  nodes.map((node, index) => {
    drawLine(index, nodes, node, depth)

    if (node.type === types.DIRECTORY) {
      if (!!node?.children.length) {
        drawAsciiTree(node.children, depth + 1)
      }
    }
  })
}

const leafy = (path, options) => {
  const nodes = directoryTree(path, options)
  if (options?.gui) {
    console.log(nodes.name)
    drawAsciiTree(nodes.children)
  }
  // console.log(nodes)
}

leafy('../../../Documents/Workspace/cooky/cooky-server', { exclude: ['node_modules', '.git', '.idea'], hash: true, gui: true })