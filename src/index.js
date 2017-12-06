/* @flow */

// PROPERTIES
const _levels: Map<string, number> = new Map([])

let _levelIndex = 0
let _levelsMask = Number.MAX_SAFE_INTEGER

let _prefixLogCallback: ?(() => string)

// PRIVATE
const getMessageBody = (...rest: any[]): any[] => {
    if (_prefixLogCallback != null) return [ `\x1b[33m${_prefixLogCallback()}\x1b[0m`, ...rest ]

    return rest
}

const processArgs = (...rest: any[]): { allow: boolean, args: any[] } => {
    let allow = true
    const args = rest

    const logLevel = args[0]
    const bit = _levels.get(logLevel)
    if (bit != null) {
        allow = (_levelsMask & bit) !== 0
        if (allow) {
            args.splice(0, 1, `\x1b[90m${logLevel} |\x1b[0m`)
        }
    }

    return { allow, args }
}

// PUBLIC
const log = (...rest: any[]) => {
    const { allow, args } = processArgs(...rest)
    if (!allow) return

    console.log.apply(null, getMessageBody(...args))
}

const error = (...rest: any[]) => {
    const { allow, args } = processArgs(...rest)
    if (!allow) return

    console.error.apply(null, getMessageBody(...args))
}

const registerLevel = (name: string) => {
    _levels.set(name, 1 << _levelIndex)
    _levelIndex += 1
}

const registerLevels = (names: string[]) => {
    names.forEach(registerLevel)
}

const setLevelsFromIndexes = (...rest: number[]) => {
    _levelsMask = rest.reduce((prev: number, cur: number): number => prev | (1 << cur), 0)
}

const setMaxLevels = () => {
    _levelsMask = Number.MAX_SAFE_INTEGER
}

const setLevels = (...rest: string[]) => {
    // FIXME
    // _levelsMask = rest.reduce((prev: number, cur: Level): number => prev | cur.bit, 0)
}

module.exports = {
    log,
    error,

    registerLevel,
    registerLevels,

    setMaxLevels,
    setLevels,
    setLevelsFromIndexes,

    set prefixLogCallback(value: () => string) {
        _prefixLogCallback = value
    }
}
