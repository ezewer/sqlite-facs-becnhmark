'use strict'

const Database = require('better-sqlite3')

const path = require('path')

const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const tmpDir = path.join(__dirname, 'directBetter')

rimraf.sync(tmpDir)
mkdirp.sync(tmpDir)

// BetterSqliteFac.ctx = { root: '' }
// database.run( 'PRAGMA journal_mode = WAL;' )
const dbPath = path.join(tmpDir, 'db-sqlite.db')
const db = new Database(dbPath, { timeout: 20000 })

async function setPragma () {
  // .pragma
  db.pragma('journal_mode = WAL', { simple: true })
  db.pragma('synchronous=OFF', { simple: true })
}

async function resetBetterSqlTable () {
  const stm = db.prepare('DROP TABLE IF EXISTS numbers')
  stm.run()
  const stm2 = db.prepare('CREATE TABLE IF NOT EXISTS numbers (number INTEGER)')
  stm2.run()
}

async function insertNum (number) {
  const stm = db.prepare('INSERT INTO numbers VALUES (?)')
  return stm.run([number])
}

async function insertManyNums (params) {
  const vals = params.map(v => '(?)').join(', ')
  const sql = `INSERT INTO numbers VALUES ${vals}`
  const stm = db.prepare(sql)
  return stm.run(params)
}

async function findVals (params = []) {
  let sql = 'SELECT number FROM numbers'
  if (params.length) sql += ' WHERE number = ?'
  const stm = db.prepare(sql)
  return (params.length) ? stm.all(params) : stm.all()
}

module.exports = {
  setPragma,
  insertNum,
  insertManyNums,
  findVals,
  resetBetterSqlTable
}
