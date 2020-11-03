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

function _run (sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteFac.db.run(sql, params, function (err) {
      if (err) {
        reject(err)

        return
      }

      resolve(this)
    })
  })
}

function _parallelize (fn) {
  return new Promise((resolve, reject) => {
    try {
      sqliteFac.db.parallelize(async function () {
        try {
          const res = await fn()

          resolve(res)
        } catch (err) {
          reject(err)
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}

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

async function insertManyNumsByTrans (params) {
  return new Promise((resolve, reject) => {
    sqliteFac.db.serialize(async () => {
      let isTransBegun = false

      try {
        await _run('BEGIN TRANSACTION')
        isTransBegun = true

        const res = await _parallelize(async () => {
          const promises = []

          for (const { number } of params) {
            const promise = insertNum(number)
            promises.push(promise)
          }

          await Promise.all(promises)
        })

        await _run('COMMIT')
        resolve(res)
      } catch (err) {
        try {
          if (isTransBegun) {
            await _run('ROLLBACK')
          }
        } catch (err) {
          reject(err)

          return
        }

        reject(err)
      }
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
  resetSqlLiteTable,
  insertManyNumsByTrans
}
