'use strict'

const BetterSqliteFac = require('bfx-facs-db-better-sqlite')

const path = require('path')

const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const tmpDir = path.join(__dirname, 'better')
const dbPathAbsolute = tmpDir
const caller = { ctx: { root: __dirname } }
const workerPathAbsolute = path.join(
  __dirname,
  'node_modules',
  'bfx-facs-db-better-sqlite',
  'test/extended-worker/index.js'
)

rimraf.sync(tmpDir)
mkdirp.sync(tmpDir)

// BetterSqliteFac.ctx = { root: '' }
// database.run( 'PRAGMA journal_mode = WAL;' )
const betterFac = new BetterSqliteFac(
  caller,
  { dbPathAbsolute, workerPathAbsolute, timeout: 20000 }
)

async function startBetterSqlLite () {
  return new Promise((resolve, reject) => {
    betterFac.start((err) => {
      if (err) return reject(err)
      return resolve(true)
    })
  })
}

async function setPragma () {
  await betterFac.asyncQuery({
    action: 'EXEC_PRAGMA',
    sql: 'journal_mode = WAL'
  })
  await betterFac.asyncQuery({
    action: 'EXEC_PRAGMA',
    sql: 'synchronous=OFF'
  })
}

async function resetBetterSqlTable () {
  await betterFac.asyncQuery({
    action: 'RUN',
    sql: 'DROP TABLE IF EXISTS numbers'
  })
  await betterFac.asyncQuery({
    action: 'RUN',
    sql: 'CREATE TABLE IF NOT EXISTS numbers (number INTEGER)'
  })
}

async function insertNum (number) {
  return betterFac.asyncQuery({
    action: 'RUN',
    sql: 'INSERT INTO numbers VALUES (?)',
    params: [number]
  })
}

async function insertManyNums (params) {
  const vals = params.map(v => '(?)').join(', ')
  const sql = `INSERT INTO numbers VALUES ${vals}`
  return betterFac.asyncQuery({
    action: 'RUN',
    sql,
    params
  })
}

async function insertManyNumsByTrans (params) {
  return betterFac.asyncQuery({
    action: 'RUN_IN_TRANS',
    sql: 'INSERT INTO numbers(number) VALUES($number)',
    params
  })
}

async function findVals (params = []) {
  let sql = 'SELECT number FROM numbers'
  if (params.length) sql += ' WHERE number = ?'
  return betterFac.asyncQuery({
    action: 'ALL',
    sql,
    params
  })
}

module.exports = {
  startBetterSqlLite,
  setPragma,
  insertNum,
  insertManyNums,
  findVals,
  resetBetterSqlTable,
  insertManyNumsByTrans
}
