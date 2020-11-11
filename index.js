'use strict'

const { testBetterSqlitePerformance } = require('./betterPerformance')
const { testDirectBetterSqlitePerformance } = require('./directBetterPerformance')
const { testSqlitePerformance } = require('./sqlitePerformance')
const betN = 'Better-SqlLite3'
const betD = 'Directly-Better-SqlLite3'
const sqlN = 'SqlLite3'

async function compare () {
  const nums = new Array(999).fill().map((v, i) => i)
  const transParams = new Array(1000000).fill()
    .map((v, number) => ({ number }))
  console.log('-----------------------------------')
  console.log(`Test ${betN} Performance: `)
  console.log('')
  const betterSqlite = await testBetterSqlitePerformance(nums, transParams)
  console.log('-----------------------------------')
  console.log(`Test ${betD} Performance: `)
  console.log('')
  const directBetterSqlite = await testDirectBetterSqlitePerformance(nums)
  console.log('-----------------------------------')
  console.log(`Test ${sqlN} Performance: `)
  console.log('')
  const sqlite = await testSqlitePerformance(nums, transParams)
  console.log('-----------------------------------')
  console.log(`Comparison between ${betN} and ${sqlN} Performance: `)
  console.log('')
  checkPerformance(
    'Simple insertions',
    betterSqlite.oneByOneTakes,
    sqlite.oneByOneTakes
  )
  checkPerformance(
    'Parallel insertions',
    betterSqlite.parallelTakes,
    sqlite.parallelTakes
  )
  checkPerformance(
    'Array insertions',
    betterSqlite.instArrTakes,
    sqlite.instArrTakes
  )
  checkPerformance(
    'Find All',
    betterSqlite.findTakes,
    sqlite.findTakes
  )
  checkPerformance(
    'Array insertions by transaction',
    betterSqlite.instArrByTransTakes,
    sqlite.instArrByTransTakes
  )
  console.log('-----------------------------------')

  console.log(`Comparison between ${betD} and ${sqlN} Performance: `)
  console.log('')
  checkPerformance(
    'Simple insertions',
    directBetterSqlite.oneByOneTakes,
    sqlite.oneByOneTakes
  )
  checkPerformance(
    'Parallel insertions',
    directBetterSqlite.parallelTakes,
    sqlite.parallelTakes
  )
  checkPerformance(
    'Array insertions',
    directBetterSqlite.instArrTakes,
    sqlite.instArrTakes
  )
  checkPerformance(
    'Find All',
    directBetterSqlite.findTakes,
    sqlite.findTakes
  )
  console.log('-----------------------------------')

  process.exit(0)
}

function checkPerformance (fnc, bet, sql) {
  if (bet === sql) return console.log(`In ${fnc}, performance is similar`)
  const faster = (bet < sql) ? betN : sqlN
  console.log(`In ${fnc}, ${faster} is ${getX(bet, sql)}`)
}

function getX (num1, num2) {
  const min = Math.min(num1, num2)
  const max = Math.max(num1, num2)
  return `${parseFloat(max / min).toFixed(2)}X times faster`
}
compare()
