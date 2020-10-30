'use strict'

const SqliteFac = require('bfx-facs-db-sqlite')

const path = require('path')

const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const tmpDir = path.join(__dirname, 'sqlite')

rimraf.sync(tmpDir)
mkdirp.sync(tmpDir)

SqliteFac.ctx = { root: '' }
// database.run( 'PRAGMA journal_mode = WAL;' )
const sqliteFac = new SqliteFac(SqliteFac, {
  db: path.join(__dirname, 'sqlite', 'test.db'),
  dirConf: path.join(__dirname, 'sqliteconf'),
  runSqlAtStart: [
    'CREATE TABLE IF NOT EXISTS numbers (number INT);',
    'PRAGMA journal_mode = WAL;',
    'PRAGMA synchronous=OFF;'
  ]
})

async function startSqlLite () {
  return new Promise((resolve, reject) => {
    sqliteFac._start((err, res) => {
      if (err) return reject(err)
      return resolve(res)
    })
  })
}

async function resetSqlLiteTable () {
  await dropSqlLiteTable()
  await createSqlLiteTable()
}

async function dropSqlLiteTable () {
  return new Promise((resolve, reject) => {
    const sql = 'DROP TABLE IF EXISTS numbers'
    sqliteFac.db.run(sql, [], function (err, res) {
      if (err) return reject(err)
      return resolve(true)
    })
  })
}

async function createSqlLiteTable () {
  return new Promise((resolve, reject) => {
    const sql = 'CREATE TABLE IF NOT EXISTS numbers (number INT)'
    sqliteFac.db.run(sql, [], function (err, res) {
      if (err) return reject(err)
      return resolve(true)
    })
  })
}
async function insertNum (num) {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO numbers VALUES (?)'
    sqliteFac.db.run(sql, [num], function (err, res) {
      if (err) return reject(err)
      return resolve(true)
    })
  })
}

async function insertManyNums (params) {
  return new Promise((resolve, reject) => {
    const vals = params.map(v => '(?)').join(', ')
    const sql = `INSERT INTO numbers VALUES ${vals}`
    sqliteFac.db.run(sql, params, function (err, res) {
      if (err) return reject(err)
      return resolve(true)
    })
  })
}

async function findVals (params = []) {
  return new Promise((resolve, reject) => {
    let sql = 'SELECT number FROM numbers'
    if (params.length) sql += ' WHERE number = ?'
    sqliteFac.db.all(sql, params, (err, rows) => {
      if (err) return reject(err)
      return resolve(rows)
    })
  })
}

module.exports = {
  startSqlLite,
  insertNum,
  insertManyNums,
  findVals,
  resetSqlLiteTable
}
